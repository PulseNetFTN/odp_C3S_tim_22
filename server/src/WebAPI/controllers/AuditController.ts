import { Request, Response, Router } from 'express';
import { IAuditService } from '../../Domain/services/audit/IAuditService';
import { authenticate } from '../../Middlewares/authentification/AuthMiddleware';
import { authorize } from '../../Middlewares/authorization/AuthorizeMiddleware';
import { UserRole } from '../../Domain/enums/UserRole';
import { sendServiceResult } from '../helpers/responseHelper';
import { PAGING } from '../../constants/paging'

export class AuditController {
    private router: Router;
    private auditService: IAuditService;

    constructor(auditService: IAuditService) {
        this.router = Router();
        this.auditService = auditService;
        this.initializeRoutes();
    }

    private initializeRoutes(): void {
        this.router.get('/audits/logs', authenticate, authorize(UserRole.Admin), this.getLogs.bind(this));
    }

    private async getLogs(req: Request, res: Response): Promise<void> {
        try {
            const page = parseInt(String(req.query.page)) || PAGING.PAGE_MIN;
            const limit = parseInt(String(req.query.limit)) || PAGING.LIMIT;

            if (page < PAGING.PAGE_MIN || limit < PAGING.PAGE_MIN || limit > PAGING.PAGE_MAX) {
                res.status(400).json({ success: false, message: 'Invalid pagination parameters' });
                return;
            }

            const result = await this.auditService.getAuditLogs({ page, limit });
            sendServiceResult(res, result);
        } catch {
            res.status(500).json({ success: false, message: 'Internal server error' });
        }
    }

    public getRouter(): Router {
        return this.router;
    }
}