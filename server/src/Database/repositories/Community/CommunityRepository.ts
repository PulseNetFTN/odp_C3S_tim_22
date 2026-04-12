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
                'INSERT INTO communities (name, description, rules, type, avatar, creator_id,created_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
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
                'SELECT id,name, description, rules, type, avatar, creator_id,created_at FROM communities WHERE id = ?',
                [id]
            );
            if (rows.length > 0) {
                const r = rows[0];
                return new Community(r.id,r.name, r.description, r.rules, r.type, r.avatar, r.creator_id, r.created_at);
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
                        'SELECT id,name, description, rules, type, avatar, creator_id,created_at FROM communities ORDER BY id ASC'
                    );
                    return rows.map(r => new Community(r.id,r.name, r.description, r.rules, r.type, r.avatar, r.creator_id, r.created_at));
                } catch {
                    return [];
                }        
      }

      async getPublic(): Promise<Community[]>
      {
        try {
            const conn = getReadConnection();
            if (!conn.success || !conn.data) return [];
            const [rows] = await conn.data.execute<RowDataPacket[]>(
                `SELECT id, name, description, rules, type, avatar, creator_id, created_at FROM communities WHERE type LIKE 'public'`,

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
        try {
        const conn = getReadConnection();
        if (!conn.success || !conn.data) return [];
        const [rows] = await conn.data.execute<RowDataPacket[]>(
            `SELECT cm.user_id
            FROM community_members cm
            WHERE cm.community_id = ?`,
            [communityId]
        );
    
        if (rows.length > 0) {
            return rows.map(r => r.user_id);  
        }
        return [];
    } catch {
        return [];
    }
      }
      async addMember(userId: number, communityId: number, userRole:UserRole, status:string): Promise<boolean>
      {
            try {
        const conn = getWriteConnection();
        if (!conn.success || !conn.data) return false;
        const role = userRole === UserRole.Admin ? 'moderator' : 'member';

        const [result] = await conn.data.execute<ResultSetHeader>(
            `INSERT INTO community_members (user_id, community_id, role, status)
             VALUES (?, ?, ?, ?)`,
            [userId, communityId, role, status]
        );

        return result.affectedRows > 0;
    } catch {
        return false;
    }
      }
async updateMemberRole(userId: number, communityId: number, userRole: UserRole): Promise<boolean> {
    try {
        const conn = getWriteConnection();
        if (!conn.success || !conn.data) return false;
        const role = userRole === UserRole.Admin ? 'moderator' : 'member';

        const [result] = await conn.data.execute<ResultSetHeader>(
            `UPDATE community_members 
             SET role = ? 
             WHERE user_id = ? AND community_id = ?`,
            [role, userId, communityId]
        );

        return result.affectedRows > 0;
    } catch {
        return false;
    }
}
  async updateMemberStatus(userId: number, communityId: number, status: string): Promise<boolean> {
    try {
        const conn = getWriteConnection();
        if (!conn.success || !conn.data) return false;

        const [result] = await conn.data.execute<ResultSetHeader>(
            `UPDATE community_members 
             SET status = ? 
             WHERE user_id = ? AND community_id = ?`,
            [status, userId, communityId]
        );

        return result.affectedRows > 0;
    } catch {
        return false;
    }
}
      async removeMember(userId: number, communittyId: number): Promise<boolean> {
        try {
            const conn = getWriteConnection();
            if (!conn.success || !conn.data) return false;
            const [result] = await conn.data.execute<ResultSetHeader>(
                'DELETE FROM community_members WHERE user_id = ? AND community_id = ?',
                [userId, communittyId]
            );
        return result.affectedRows > 0;
    } catch {
        return false;
    }
}

      
}