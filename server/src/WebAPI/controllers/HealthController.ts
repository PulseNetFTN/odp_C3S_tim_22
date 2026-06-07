import { Request, Response, Router } from 'express';
import { getHealthStatus, getReadConnection, getWriteConnection, promoteSlaveToMaster } from '../../Database/connection/DbConnectionPool';
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
        this.router.post('/health/failover', authenticate, authorize(UserRole.Admin), this.triggerFailover.bind(this));
    }

    private healthCheck(req: Request, res: Response): void {
        const result = { success: true, data: { message: 'Server is running' } };
        sendServiceResult(res, result);
    }

    private async dbHealth(req: Request, res: Response): Promise<void> {
        try {
            const nodeStatus = getHealthStatus();
            const readConn = getReadConnection();
            const writeConn = getWriteConnection();

            let readPing = false;
            let writePing = false;

            if (readConn.success && readConn.data) {
                try {
                    await readConn.data.query('SELECT 1');
                    readPing = true;
                } catch { /* node unreachable */ }
            }

            if (writeConn.success && writeConn.data) {
                try {
                    await writeConn.data.query('SELECT 1');
                    writePing = true;
                } catch { /* node unreachable */ }
            }

            const result = {
                success: true,
                data: {
                    nodes: nodeStatus,
                    connections: {
                        read: readPing ? 'ok' : 'unavailable',
                        write: writePing ? 'ok' : 'unavailable',
                    },
                },
            };
            sendServiceResult(res, result);
        } catch {
            const result = { success: false, message: 'Failed to retrieve DB health status', errorCode: ErrorCode.INTERNAL_ERROR };
            sendServiceResult(res, result);
        }
    }

    private triggerFailover(req: Request, res: Response): void {
        try {
            const { slaveId } = req.body;
            if (typeof slaveId !== 'number' || isNaN(slaveId)) {
                res.status(400).json({ success: false, message: 'Invalid slave ID' });
                return;
            }
            const result = promoteSlaveToMaster(slaveId);
            if (!result.success) {
                res.status(400).json({ success: false, message: result.message ?? 'Failover failed' });
                return;
            }
            res.status(200).json({ success: true, data: { message: result.data ?? `Failover to slave index ${slaveId} triggered` } });
        } catch {
            res.status(500).json({ success: false, message: 'Failed to trigger failover' });
        }
    }

    public getRouter(): Router {
        return this.router;
    }
}