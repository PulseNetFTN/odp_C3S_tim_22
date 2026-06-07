import { BaseRepository } from '../BaseRepository';
import { IAuditRepository } from '../../../Domain/repositories/audit/IAuditRepository';
import { Audit } from '../../../Domain/models/Audit';
import { mapAudit, AUDIT_FIELDS } from '../../mappers/AuditMapper';
import { RepositoryResult } from '../../../Domain/types/RepositoryResult';

export class AuditRepository extends BaseRepository implements IAuditRepository {

    async create(audit: Audit): Promise<RepositoryResult<Audit>> {
        const result = await this.executeWrite(
            'INSERT INTO audits (user_id, action, entity_type, entity_id, details, ip_address, user_agent) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id',
            [audit.userId, audit.action, audit.entityType, audit.entityId, audit.details, audit.ipAddress, audit.userAgent]
        );
        if (!result.ok) return RepositoryResult.failure(result.message);
        if (!result.data.insertId) return RepositoryResult.failure('Insert returned no ID');
        return RepositoryResult.success(new Audit(
            result.data.insertId, audit.userId, audit.action, audit.entityType,
            audit.entityId, audit.details, audit.ipAddress, audit.userAgent, new Date()
        ));
    }

    async getAll(limit: number, offset: number): Promise<Audit[]> {
        const safeLimit = Math.max(1, Math.floor(Number(limit)));
        const safeOffset = Math.max(0, Math.floor(Number(offset)));
        return this.executeRead(
            `SELECT ${AUDIT_FIELDS} FROM audits ORDER BY created_at DESC LIMIT $1 OFFSET $2`,
            [safeLimit, safeOffset],
            mapAudit
        );
    }

    async getByUserId(userId: number, limit: number, offset: number): Promise<Audit[]> {
        return this.executeRead(
            `SELECT ${AUDIT_FIELDS} FROM audits WHERE user_id = $1 ORDER BY created_at DESC LIMIT $2 OFFSET $3`,
            [Number(userId), Number(limit), Number(offset)],
            mapAudit
        );
    }

    async getTotalCount(): Promise<number> {
        const result = await this.executeScalar<number>(
            'SELECT COUNT(*)::int as count FROM audits',
            []
        );
        return result.ok ? result.data : 0;
    }
}
