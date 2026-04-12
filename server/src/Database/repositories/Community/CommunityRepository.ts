import { ResultSetHeader, RowDataPacket } from "mysql2";
import { UserRole } from "../../../Domain/enums/UserRole";
import { Community } from "../../../Domain/models/Community";
import { CommunityMember } from "../../../Domain/models/CommunityMember";
import { ICommunityRepository } from "../../../Domain/repositories/users/ICommunityRepository";
import { getReadConnection, getWriteConnection } from "../../connection/DbConnectionPool";

export class CommunityRepository implements ICommunityRepository
{
      async create(community: Community): Promise<Community>
      {      
      try {
            const conn = getWriteConnection();
            if (!conn.success || !conn.data) return new Community();
            const [result] = await conn.data.execute<ResultSetHeader>(
                'INSERT INTO communities (communityName, description, rules, communityType, icon, creatorId,createdAt) VALUES (?, ?, ?, ?, ?, ?, ?)',
                [community.communityName, community.description, community.rules, community.communityType, community.icon, community.creatorId, community.createdAt]
            );
            if (result.insertId) {
                return new Community(result.insertId, community.communityName, community.description, community.rules, community.communityType, community.icon, community.creatorId, community.createdAt);
            }
            return new Community();
        } catch {
            return new Community();
        }
      }
      async getById(id: number): Promise<Community>
      {
        try {
            const conn = getReadConnection();
            if (!conn.success || !conn.data) return new Community();
            const [rows] = await conn.data.execute<RowDataPacket[]>(
                'SELECT id, communityName, description, rules, communityType, icon, creatorId,createdAt FROM communities WHERE id = ?',
                [id]
            );
            if (rows.length > 0) {
                const r = rows[0];
                return new Community(r.id,r.communityName, r.description, r.rules, r.communityType, r.icon, r.creatorId, r.createdAt);
            }
            return new Community();
        } catch {
            return new Community();
        }
      }
      async getAll(): Promise<Community[]>
      {
         try {
                    const conn = getReadConnection();
                    if (!conn.success || !conn.data) return [];
                    const [rows] = await conn.data.execute<RowDataPacket[]>(
                        'SELECT id,communityName, description, rules, communityType, icon, creatorId,createdAt FROM communities ORDER BY id ASC'
                    );
                    return rows.map(r => new Community((r.id,r.communityName, r.description, r.rules, r.communityType, r.icon, r.creatorId, r.createdAt)));
                } catch {
                    return [];
                }        
      }

      async getPublic(): Promise<Community[]>
      {



      }

      async getByUserId(userId: number): Promise<Community[]>
      {

        

      }

      async update(communityName: Community): Promise<Community>
      {
        try {
                    const conn = getWriteConnection();
                    if (!conn.success || !conn.data) return new Community();
                    const [result] = await conn.data.execute<ResultSetHeader>(
                        'UPDATE communities SET communityName = ?, description = ?, rules = ?, communityType = ?, icon = ?, creatorId = ?,createdAt = ? WHERE id = ?',
                        [communityName.communityName, communityName.description, communityName.rules, communityName.communityType, communityName.icon, communityName.creatorId, communityName.createdAt, communityName.id]
                    );
                    if (result.affectedRows > 0) return communityName;
                    return new Community();
                } catch {
                    return new Community();
                }
      }
      async updateType(id: number, CommunityType: string): Promise<boolean>
      {
         try {
            const conn = getWriteConnection();
            if (!conn.success || !conn.data) return false;
            const [result] = await conn.data.execute<ResultSetHeader>(
                'UPDATE communities SET type = ? WHERE id = ?',
                [CommunityType, id]
            );
            return result.affectedRows > 0;
        } catch {
            return false;
        }
      }
      async delete(id: number): Promise<boolean>
      {
         try {
            const conn = getWriteConnection();
            if (!conn.success || !conn.data) return false;
            const [result] = await conn.data.execute<ResultSetHeader>(
                'DELETE FROM communities WHERE id = ?',
                [id]
            );
            return result.affectedRows > 0;
        } catch {
            return false;
        }
      }
      async getMemberCount(id: number): Promise<number>
      {
        
      }
      async getMember(userId: number, communityId: number): Promise<CommunityMember>
      {

      }
      async getMembers(id: number, communittyId:number): Promise<CommunityMember[]>
      {
        try {
                    const conn = getReadConnection();
                    if (!conn.success || !conn.data) return [];
                    const [rows] = await conn.data.execute<RowDataPacket[]>(
                        `SELECT c.id, c.username, c.email, c.first_name, c.last_name, c.bio, c.profile_image, c.role
                         FROM users u
                         INNER JOIN user_follows uf ON uf.follower_id = u.id
                         WHERE uf.following_id = ?`,
                        [id]
                    );
                    return rows.map(r => new CommunityMember(r.id, r.username, r.email, r.first_name, r.last_name, r.bio, r.profile_image, r.role));
                } catch {
                    return [];
                }
      }
      async addMember(userId: number, communityId: number, userRole:UserRole, status:string): Promise<boolean>
      {

      }
      async updateMemberRole(userId:number,communityId:number,userRole:UserRole) : Promise<boolean>
      {

      }
      async updateMemberStatus(userId:number,communityId:number, status:string) : Promise<boolean>
      {

      }
      async removeMember(userId:number,communittyId:number): Promise<boolean>
      {


      }

      
}