import { RowDataPacket } from 'mysql2';
import { Audit } from '../../Domain/models/Audit';

export const AUDIT_FIELDS = 'id, user_id, action, entity_type, entity_id, details, ip_address, user_agent, created_at';

export function mapAudit(r: RowDataPacket): Audit {
    return new Audit(
        r.id, r.user_id, r.action, r.entity_type, r.entity_id,
        r.details, r.ip_address, r.user_agent, r.created_at
    );
}