import { Community } from '../../../Domain/models/Community';
import { ICommunityRepository } from '../../../Domain/repositories/communities/ICommunityRepository';
import { BaseRepository } from '../BaseRepository';
import { mapCommunity, COMMUNITY_FIELDS } from '../../mappers/CommunityMapper';
import { RowDataPacket } from 'mysql2';

export class CommunityRepository extends BaseRepository implements ICommunityRepository {

    async create(community: Community): Promise<Community | null> {
        const result = await this.executeWrite(
            'INSERT INTO communities (name, description, rules, type, avatar, creator_id) VALUES (?, ?, ?, ?, ?, ?)',
            [community.communityName, community.description, community.rules, community.communityType, community.icon, community.creatorId]
        );
        if (!result?.insertId) return null;
        return new Community(result.insertId, community.communityName, community.description, community.rules, community.communityType, community.icon, community.creatorId, new Date());
    }

    async getById(id: number): Promise<Community | null> {
        return this.executeReadOne(
            `SELECT ${COMMUNITY_FIELDS} FROM communities WHERE id = ?`,
            [id],
            mapCommunity
        );
    }

    async searchByName(query: string): Promise<Community[]> {
            return this.executeRead(
                  `SELECT ${COMMUNITY_FIELDS} FROM communities WHERE name LIKE ? ORDER BY name ASC LIMIT 20`,
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
            'SELECT community_id FROM community_members WHERE user_id = ?',
            [userId],
            (r: RowDataPacket) => r.community_id as number
        );
        if (!ids || ids.length === 0) return [];
        return this.getByIds(ids);
    }

    async update(community: Community): Promise<Community | null> {
        const result = await this.executeWrite(
            'UPDATE communities SET name = ?, description = ?, rules = ?, type = ?, avatar = ? WHERE id = ?',
            [community.communityName, community.description, community.rules, community.communityType, community.icon, community.id]
        );
        if (!result || result.affectedRows === 0) return null;
        return community;
    }

    async delete(id: number): Promise<boolean> {
        const result = await this.executeWrite(
            'DELETE FROM communities WHERE id = ?',
            [id]
        );
        return (result?.affectedRows ?? 0) > 0;
    }
}