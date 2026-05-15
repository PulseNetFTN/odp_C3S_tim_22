import { AuditDto } from '../../DTOs/audit/AuditDto';
import { ServiceResult } from '../../types/ServiceResult';
import { AuditLogInput, GetAuditLogsInput } from '../../types/inputs/AuditInputs';

export interface IAuditService {
    log(input: AuditLogInput): Promise<void>;
    getAuditLogs(input: GetAuditLogsInput): Promise<ServiceResult<{logs: AuditDto[]; total: number}>>;
}