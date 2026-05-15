import { Community } from "../../../Domain/models/Community";
import { ICommunityRepository } from "../../../Domain/repositories/communities/ICommunityRepository";
import { BaseRepository } from "../BaseRepository";
import { mapCommunity,COMMUNITY_FIELDS } from '../../mappers/CommunityMapper';

//GET BY USER ID MORA JOIN FIGURE IT OUT SOMETIME

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
            /*
            const [rows] = await conn.data.execute<RowDataPacket[]>(
               `SELECT c.id, c.name, c.description, c.rules, c.type, c.avatar, c.creator_id, c.created_at
                            FROM communities c
                            INNER JOIN community_members cm ON cm.community_id = c.id
                            WHERE cm.user_id = ? 
                         `,[userId]
            );
            
            */
           //joinnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnn 


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