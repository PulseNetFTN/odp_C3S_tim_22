import { Community } from "../../../Domain/models/Community";
import { ICommunityRepository } from "../../../Domain/repositories/communities/ICommunityRepository";
import { BaseRepository } from "../BaseRepository";
import { mapCommunity,COMMUNITY_FIELDS } from '../../mappers/CommunityMapper';
import { COMMUNITY_MEMBER_FIELDS, mapCommunityMember } from "../../mappers/CommunityMemberMapper";

export class CommunityRepository extends BaseRepository implements ICommunityRepository
{
     
      async create(community: Community): Promise<Community | null>
      {      
            const result = await this.executeWrite(
                'INSERT INTO communities (name, description, rules, type, avatar, creator_id,created_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
                [community.communityName, community.description, community.rules, community.communityType, community.icon, community.creatorId, community.createdAt]
            );
            if (!result?.insertId)return null; 
            return new Community(result.insertId, community.communityName, community.description, community.rules, community.communityType, community.icon, community.creatorId, community.createdAt);
      }
      async getById(id: number): Promise<Community | null>
      {
            return this.executeReadOne(`SELECT ${COMMUNITY_FIELDS} FROM communities WHERE id = ?`,  [id],mapCommunity);
      }

      async getByIds(ids: number[]): Promise<Community[]> {
           if (!ids || ids.length === 0) return [];
        const placeholders = ids.map(() => '?').join(',');
        const result = await this.executeRead(
            `SELECT ${COMMUNITY_FIELDS} FROM comunities WHERE id IN (${placeholders})`,
            ids,
            mapCommunity
        );
        return result;
      }
      async getAll(): Promise<Community[]>
      {
            return this.executeRead(`SELECT ${COMMUNITY_FIELDS} FROM communities ORDER BY id ASC`,[],mapCommunity);   
      }

      async getPublic(): Promise<Community[]>
      {
            return this.executeRead(`SELECT ${COMMUNITY_FIELDS} FROM communities WHERE type LIKE 'public'`,[],mapCommunity);
      }

      async getByUserId(userId: number): Promise<Community[]>
      {
            const ids = await this.executeRead(`SELECT community_id FROM communitiy_members WHERE user_id = ?`,[userId],Number);
            if(!ids || ids.length === 0) return[];
            return this.getByIds(ids);
      }

      async update(communityName: Community): Promise<Community | null>
      {

        const result = await this.executeWrite( 'UPDATE communities SET name = ?, description = ?, rules = ?, type = ?, icon = ?, creator_id = ?,created_at = ? WHERE id = ?',
                        [communityName.communityName, communityName.description, communityName.rules, communityName.communityType, communityName.icon, communityName.creatorId, communityName.createdAt, communityName.id]
        );
        if(!result || result.affectedRows === 0) return null;

        return communityName;

      }

      async delete(id: number): Promise<boolean>
      {
                const result = await this.executeWrite('DELETE FROM communities WHERE id = ?',[id]);
                return (result?.affectedRows ?? 0) > 0;
        }
      
      
}