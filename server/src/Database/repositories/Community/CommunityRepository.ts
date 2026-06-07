import { Community } from '../../../Domain/models/Community';
import { ICommunityRepository } from '../../../Domain/repositories/communities/ICommunityRepository';
import { BaseRepository } from '../BaseRepository';
import { mapCommunity, COMMUNITY_FIELDS } from '../../mappers/CommunityMapper';
import { RepositoryResult } from '../../../Domain/types/RepositoryResult';

export class CommunityRepository extends BaseRepository implements ICommunityRepository {

    async create(community: Community): Promise<RepositoryResult<Community>> {
        const result = await this.executeWrite(
            'INSERT INTO communities (name, description, rules, type, avatar, creator_id) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id',
            [community.name, community.description, community.rules, community.type, community.avatar, community.creatorId]
        );
        if (!result.ok) return RepositoryResult.failure(result.message);
        if (!result.data.insertId) return RepositoryResult.failure('Insert returned no ID');
        return RepositoryResult.success(
            new Community(result.data.insertId, community.name, community.description, community.rules, community.type, community.avatar, community.creatorId, new Date())
        );
    }

    async getById(id: number): Promise<RepositoryResult<Community>> {
        return this.executeReadOne(
            `SELECT ${COMMUNITY_FIELDS} FROM communities WHERE id = $1`,
            [id],
            mapCommunity
        );
    }

    async searchByName(query: string): Promise<Community[]> {
        return this.executeRead(
            `SELECT ${COMMUNITY_FIELDS} FROM communities WHERE name ILIKE $1 ORDER BY name ASC LIMIT 20`,
            [`%${query}%`],
            mapCommunity
        );
    }

    async getByIds(ids: number[]): Promise<Community[]> {
        if (!ids || ids.length === 0) return [];
        const placeholders = this.buildPlaceholders(ids);
        return this.executeRead(
            `SELECT ${COMMUNITY_FIELDS} FROM communities WHERE id IN (${placeholders})`,
            ids,
            mapCommunity
        );
    }

    async getAll(): Promise<Community[]> {
        return this.executeRead(
            `SELECT ${COMMUNITY_FIELDS} FROM communities ORDER BY id ASC`,
            [],
            mapCommunity
        );
    }

    async getPublic(): Promise<Community[]> {
        return this.executeRead(
            `SELECT ${COMMUNITY_FIELDS} FROM communities WHERE type = 'public'`,
            [],
            mapCommunity
        );
    }

    async getByUserId(userId: number): Promise<Community[]> {
        const ids = await this.executeRead(
            'SELECT community_id FROM community_members WHERE user_id = $1',
            [userId],
            (r) => r.community_id as number
        );
        if (!ids || ids.length === 0) return [];
        return this.getByIds(ids);
    }

    async update(community: Community): Promise<RepositoryResult<Community>> {
        const result = await this.executeWrite(
            'UPDATE communities SET name = $1, description = $2, rules = $3, type = $4, avatar = $5 WHERE id = $6',
            [community.name, community.description, community.rules, community.type, community.avatar, community.id]
        );
        if (!result.ok) return RepositoryResult.failure(result.message);
        if (result.data.affectedRows === 0) return RepositoryResult.notFound('Community not found for update');
        return RepositoryResult.success(community);
    }

    async delete(id: number): Promise<boolean> {
        const result = await this.executeWrite('DELETE FROM communities WHERE id = $1', [id]);
        return result.ok && result.data.affectedRows > 0;
    }
}
