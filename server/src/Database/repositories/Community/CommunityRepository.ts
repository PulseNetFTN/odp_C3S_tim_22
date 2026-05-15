import { ResultSetHeader, RowDataPacket } from "mysql2";
import { UserRole } from "../../../Domain/enums/UserRole";
import { Community } from "../../../Domain/models/Community";
import { CommunityMember } from "../../../Domain/models/CommunityMember";
import { ICommunityRepository } from "../../../Domain/repositories/communities/ICommunityRepository";
import { getReadConnection, getWriteConnection } from "../../connection/DbConnectionPool";
import { BaseRepository } from "../BaseRepository";
import { mapCommunity,COMMUNITY_FIELDS } from '../../mappers/CommunityMapper';
import { mapCommunityMember,COMMUNITY_MEMBER_FIELDS } from '../../mappers/CommunityMemberMapper';


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
                try {
            const conn = getReadConnection();
            if (!conn.success || !conn.data) return [];
            const [rows] = await conn.data.execute<RowDataPacket[]>(
               `SELECT c.id, c.name, c.description, c.rules, c.type, c.avatar, c.creator_id, c.created_at
                            FROM communities c
                            INNER JOIN community_members cm ON cm.community_id = c.id
                            WHERE cm.user_id = ? 
                         `,[userId]
            );
            if (rows.length > 0) {
                const r = rows[0];
                 return rows.map(r => new Community(r.id,r.name, r.description, r.rules, r.type, r.avatar, r.creator_id, r.created_at));
            }
            return [];
        } catch {
            return [];
        }


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
      async getMemberCount(id: number): Promise<number>
      {
         try {
            const conn = getWriteConnection();
            if (!conn.success || !conn.data) return 0;
            const [result] = await conn.data.execute<ResultSetHeader>(
                'SELECT id FROM communities',
                [id]
            );
            return result.affectedRows;
        } catch {
            return 0;
        }
      }
      async getMember(userId: number, communityId: number): Promise<CommunityMember>
      {
        try {
            const conn = getReadConnection();
            if (!conn.success || !conn.data) return new CommunityMember();
            const [rows] = await conn.data.execute<RowDataPacket[]>(
                        `SELECT u.id, cm.community_id, cm.status, cm.role, cm.joined_at
                            FROM users u
                            INNER JOIN community_members cm ON cm.user_id = u.id
                            WHERE u.id = ? AND cm.community_id = ?
                         `,
                          [userId,communityId]
                    );
                                if (rows.length > 0) {
                const r = rows[0];
                return new CommunityMember(r.id,r.community_id,r.status,r.role,r.joined_at);
            }
            return new CommunityMember();
        } catch {
            return new CommunityMember();
        }

      }
      async getMembers( communityId:number): Promise<CommunityMember[]>
      {
        try {
                    const conn = getReadConnection();
                    if (!conn.success || !conn.data) return [];
                    const [rows] = await conn.data.execute<RowDataPacket[]>(
                        `SELECT u.id, cm.community_id, cm.status, cm.role, cm.joined_at
                         FROM community_members cm, users u
                         INNER JOIN community_members cm ON cm.user_id = u.id
                         WHERE cm.community_id = ?
                         `,
                        [communityId]
                    );
                    return rows.map(r => new CommunityMember(r.id, r.community_id, r.status, r.role,r.joined_at));
                } catch {
                    return [];
                }
      }

      async getMemberUserIds(communityId: number): Promise<number[]> {
        const rows = await this.executeRead(
            `SELECT cm.user_id
            FROM community_members cm
            WHERE cm.community_id = ?`,
            [communityId],mapCommunityMember
        );    
        if (rows.length > 0) {
            return rows.map(r => r.);  
        }
      }
      async addMember(userId: number, communityId: number, userRole:UserRole, status:string): Promise<boolean>
      {

        const role = userRole === UserRole.Admin ? 'moderator' : 'member';

        const result = await this.executeWrite(
            `INSERT INTO community_members (user_id, community_id, role, status)
             VALUES (?, ?, ?, ?)`,
            [userId, communityId, role, status]);
        

        return (result?.affectedRows ?? 0) > 0;

      }
async updateMemberRole(userId: number, communityId: number, userRole: UserRole): Promise<boolean> {

        const role = userRole === UserRole.Admin ? 'moderator' : 'member';

        const result = await this.executeWrite(
            `UPDATE community_members 
             SET role = ? 
             WHERE user_id = ? AND community_id = ?`,
            [role, userId, communityId]
        );

        return (result?.affectedRows ?? 0) > 0;

}
  async updateMemberStatus(userId: number, communityId: number, status: string): Promise<boolean> {
    {
           const result = await this.executeWrite( 
            `UPDATE community_members 
             SET status = ? 
             WHERE user_id = ? AND community_id = ?`,
            [status, userId, communityId]);
        
        return (result?.affectedRows ?? 0)> 0;
    }
}
      async removeMember(userId: number, communittyId: number): Promise<boolean> {
      
            const result = await this.executeWrite(
                'DELETE FROM community_members WHERE user_id = ? AND community_id = ?',
                [userId, communittyId]);    
        return (result?.affectedRows ?? 0) > 0;
    
}

      
}