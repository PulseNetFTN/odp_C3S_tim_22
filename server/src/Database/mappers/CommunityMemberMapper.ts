import { RowDataPacket } from 'mysql2';
import { CommunityMember } from '../../Domain/models/CommunityMember';


export const COMMUNITY_MEMEBER_FIELDS = 'user_id, community_id, role, status';
export function mapCommunityMember(r: RowDataPacket): CommunityMember {
    return new CommunityMember(
        r.userId, r.communityId, r.status, r.role);
}