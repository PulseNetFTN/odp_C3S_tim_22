import { AuditDto } from '../../Domain/DTOs/audits/AuditDto';
import { Audit } from '../../Domain/models/Audit';
import { IAuditRepository } from '../../Domain/repositories/audits/IAuditRepository';
import { IAuditService } from '../../Domain/services/audits/IAuditService';
import { ServiceResult } from '../../Domain/types/ServiceResult';
import { AuditLogInput, GetAuditLogsInput } from '../../Domain/types/inputs/AuditInputs';

export class AuditService implements IAuditService {
    public constructor(private auditRepository: IAuditRepository) {}

    async log(input: AuditLogInput): Promise<void> {
        await this.auditRepository.create(
            new Audit(
                0,
                input.userId,
                input.action,
                input.entityType,
                input.entityId,
                input.details ?? null,
                input.ipAddress ?? null,
                input.userAgent ?? null
            )
        );
    }

    async getAuditLogs(input: GetAuditLogsInput): Promise<ServiceResult<{ logs: AuditDto[]; total: number }>> {
        const offset = (input.page - 1) * input.limit;
        const [audits, total] = await Promise.all([
            this.auditRepository.getAll(input.limit, offset),
            this.auditRepository.getTotalCount(),
        ]);

        const logs = audits.map(a => new AuditDto(
            a.id, a.userId, a.action, a.entityType, a.entityId,
            a.details, a.ipAddress, a.userAgent, a.createdAt
        ));

        return { success: true, data: { logs, total } };
    }
}