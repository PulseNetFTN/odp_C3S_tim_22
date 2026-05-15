export type AuditLogInput = {
    userId: number | null;
    action: string;
    entityType: string;
    entityId: number | null;
    details?: string;
    ipAddress?: string;
    userAgent?: string;
};
 
export type GetAuditLogsInput = {
    page: number;
    limit: number;
};