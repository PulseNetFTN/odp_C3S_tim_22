import { CommunityMember } from '../../../Domain/models/CommunityMember';
import { ICommunityMemberRepository } from '../../../Domain/repositories/communities/ICommunityMemberRepository';
import { BaseRepository } from '../BaseRepository';
import { mapCommunityMember, COMMUNITY_MEMBER_FIELDS } from '../../mappers/CommunityMemberMapper';
import { CommunityRole } from '../../../Domain/enums/CommunityRole';
import { RepositoryResult } from '../../../Domain/types/RepositoryResult';

export class CommunityMemberRepository extends BaseRepository implements ICommunityMemberRepository {

    async getMemberCount(communityId: number): Promise<number> {
        const result = await this.executeScalar<number>(
            'SELECT COUNT(*)::int as count FROM community_members WHERE community_id = $1',
            [communityId]
        );
        return result.ok ? result.data : 0;
    }

    async getMemberCountBatch(communityIds: number[]): Promise<Map<number, number>> {
        if (!communityIds || communityIds.length === 0) return new Map<number, number>();
        const placeholders = this.buildPlaceholders(communityIds);
        const result = await this.executeRead(
            `SELECT community_id, COUNT(*)::int as count FROM community_members WHERE community_id IN (${placeholders}) GROUP BY community_id`,
            communityIds,
            (r) => ({ communityId: r.community_id as number, count: r.count as number })
        );
        const countMap = new Map<number, number>();
        result.forEach(r => countMap.set(r.communityId, r.count));
        return countMap;
    }

    async getMember(userId: number, communityId: number): Promise<RepositoryResult<CommunityMember>> {
        return this.executeReadOne(
            `SELECT ${COMMUNITY_MEMBER_FIELDS} FROM community_members WHERE user_id = $1 AND community_id = $2`,
            [userId, communityId],
            mapCommunityMember
        );
    }

    async getMembers(communityId: number): Promise<CommunityMember[]> {
        return this.executeRead(
            `SELECT ${COMMUNITY_MEMBER_FIELDS} FROM community_members WHERE community_id = $1`,
            [communityId],
            mapCommunityMember
        );
    }

    async getMemberUserIds(communityId: number): Promise<number[]> {
        return this.executeRead(
            'SELECT user_id FROM community_members WHERE community_id = $1',
            [communityId],
            (r) => r.user_id as number
        );
    }

    async addMember(userId: number, communityId: number, role: CommunityRole, status: string): Promise<boolean> {
        const result = await this.executeWrite(
            'INSERT INTO community_members (user_id, community_id, role, status) VALUES ($1, $2, $3, $4)',
            [userId, communityId, role, status]
        );
        return result.ok && result.data.affectedRows > 0;
    }

    async updateMemberRole(userId: number, communityId: number, role: CommunityRole): Promise<boolean> {
        const result = await this.executeWrite(
            'UPDATE community_members SET role = $1 WHERE user_id = $2 AND community_id = $3',
            [role, userId, communityId]
        );
        return result.ok && result.data.affectedRows > 0;
    }

    async updateMemberStatus(userId: number, communityId: number, status: string): Promise<boolean> {
        const result = await this.executeWrite(
            'UPDATE community_members SET status = $1 WHERE user_id = $2 AND community_id = $3',
            [status, userId, communityId]
        );
        return result.ok && result.data.affectedRows > 0;
    }

    async removeMember(userId: number, communityId: number): Promise<boolean> {
        const result = await this.executeWrite(
            'DELETE FROM community_members WHERE user_id = $1 AND community_id = $2',
            [userId, communityId]
        );
        return result.ok && result.data.affectedRows > 0;
    }
}
