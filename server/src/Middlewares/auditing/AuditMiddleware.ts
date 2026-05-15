import { Request, Response, NextFunction } from 'express';
import { IAuditService } from '../../Domain/services/audit/IAuditService';

export function createAuditMiddleware(auditService: IAuditService) {
    return (req: Request, res: Response, next: NextFunction): void => {
        const originalJson = res.json.bind(res);

        res.json = (body: any) => {
            const userId = req.user?.id ?? null;
            const method = req.method;
            const path = req.originalUrl;
            const statusCode = res.statusCode;

            if (method !== 'GET') {
                auditService.log({
                    userId,
                    action: `${method} ${path}`,
                    entityType: 'http_request',
                    entityId: null,
                    details: JSON.stringify({
                        statusCode,
                        success: body?.success ?? null,
                    }),
                    ipAddress: req.ip ?? req.socket.remoteAddress ?? undefined,
                    userAgent: req.headers['user-agent'] ?? undefined,
                });
            }

            return originalJson(body);
        };

        next();
    };
}