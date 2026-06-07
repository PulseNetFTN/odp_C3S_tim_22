import { QueryResultRow } from 'pg';
import { CommunityMember } from '../../Domain/models/CommunityMember';

export const COMMUNITY_MEMBER_FIELDS = 'user_id, community_id, role, status, joined_at';

export function mapCommunityMember(r: QueryResultRow): CommunityMember {
    return new CommunityMember(
        r.user_id,
        r.community_id,
        r.status,
        r.role,
        r.joined_at ?? null
    );
}
