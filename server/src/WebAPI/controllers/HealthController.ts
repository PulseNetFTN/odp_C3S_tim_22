import { Request, Response, Router } from 'express';
import { getHealthStatus, promoteSlaveToMaster } from '../../Database/connection/DbConnectionPool';
import { authenticate } from '../../Middlewares/authentification/AuthMiddleware';
import { authorize } from '../../Middlewares/authorization/AuthorizeMiddleware';
import { UserRole } from '../../Domain/enums/UserRole';
import { sendServiceResult } from '../helpers/responseHelper';
import { ErrorCode } from '../../Domain/enums/ErrorCode';
import { IAuditService } from '../../Domain/services/audit/IAuditService';

export class HealthController {
    private router: Router;
    private auditService: IAuditService;

    constructor(auditService: IAuditService) {
        this.router = Router();
        this.auditService = auditService;
        this.initializeRoutes();
    }

    private initializeRoutes(): void {
        this.router.get('/health', this.healthCheck.bind(this));
        this.router.get('/health/db', authenticate, authorize(UserRole.Admin), this.dbHealth.bind(this));
        this.router.post('/health/failover', authenticate, authorize(UserRole.Admin), this.failover.bind(this));
    }

    private healthCheck(req: Request, res: Response): void {
        const result = { success: true, data: { message: 'Server is running' } };
        sendServiceResult(res, result);
    }

    private dbHealth(req: Request, res: Response): void {
        try {
            const status = getHealthStatus();
            const result = { success: true, data: status };
            sendServiceResult(res, result);
        } catch {
            const result = { success: false, message: 'Failed to retrieve DB health status', errorCode: ErrorCode.INTERNAL_ERROR };
            sendServiceResult(res, result);
        }
    }

    private async failover(req: Request, res: Response): Promise<void> {
        try {
            const { slaveIndex, slaveId } = req.body;
            const index = Number(slaveIndex ?? slaveId);
            
            if (isNaN(index) || !Number.isInteger(index) || index < 0 || index > 1) {
                await this.auditService.log({
                    userId: req.user?.id ?? null,
                    action: 'FAILOVER_INVALID_REQUEST',
                    entityType: 'database',
                    entityId: null,
                    ipAddress: req.ip ?? null,
                    userAgent: req.headers['user-agent'] ?? null,
                    details: JSON.stringify({ 
                        error: 'Invalid slaveIndex',
                        providedSlaveIndex: slaveIndex ?? slaveId
                    })
                }).catch(() => {});

                res.status(400).json({ success: false, message: 'Invalid slaveIndex. Must be 0 or 1.' });
                return;
            }

            await this.auditService.log({
                userId: req.user!.id,
                action: 'FAILOVER_TRIGGER',
                entityType: 'database',
                entityId: null,
                ipAddress: req.ip ?? null,
                userAgent: req.headers['user-agent'] ?? null,
                details: JSON.stringify({ 
                    action: 'manual_failover',
                    triggeredBy: req.user!.username,
                    slaveIndex: index,
                    timestamp: new Date().toISOString()
                })
            });

            const result = promoteSlaveToMaster(index);
            
            if (result.success) {
                await this.auditService.log({
                    userId: req.user!.id,
                    action: 'FAILOVER_SUCCESS',
                    entityType: 'database',
                    entityId: null,
                    ipAddress: req.ip ?? null,
                    userAgent: req.headers['user-agent'] ?? null,
                    details: JSON.stringify({ 
                        message: result.message,
                        slaveIndex: index
                    })
                });
            } else {
                await this.auditService.log({
                    userId: req.user!.id,
                    action: 'FAILOVER_FAILED',
                    entityType: 'database',
                    entityId: null,
                    ipAddress: req.ip ?? null,
                    userAgent: req.headers['user-agent'] ?? null,
                    details: JSON.stringify({ 
                        error: result.message,
                        slaveIndex: index
                    })
                });
            }
            
            sendServiceResult(res, result);
        } catch (error) {
            await this.auditService.log({
                userId: req.user?.id ?? null,
                action: 'FAILOVER_ERROR',
                entityType: 'database',
                entityId: null,
                ipAddress: req.ip ?? null,
                userAgent: req.headers['user-agent'] ?? null,
                details: JSON.stringify({ 
                    error: String(error),
                    slaveIndex: req.body?.slaveIndex 
                })
            }).catch(() => {});
            
            const result = { success: false, message: 'Failover failed', errorCode: ErrorCode.INTERNAL_ERROR };
            sendServiceResult(res, result);
        }
    }

    public getRouter(): Router {
        return this.router;
    }
}