import { RowDataPacket } from 'mysql2';
import { Community } from '../../Domain/models/Community';


export const COMMUNITY_FIELDS =         'id, name, description, rules, type, avatar, creator_id, created_at';
export function mapCommunity(r: RowDataPacket): Community {
    return new Community(
        r.id, r.name, r.description, r.rules, r.type,
        r.avatar, r.creator_id, r.created_at
    );
}