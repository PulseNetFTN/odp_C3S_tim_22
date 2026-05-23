import { UserRole } from "../../../Domain/enums/UserRole";
import { CommunityMember } from "../../../Domain/models/CommunityMember";
import { BaseRepository } from "../BaseRepository";
import { mapCommunityMember,COMMUNITY_MEMBER_FIELDS } from '../../mappers/CommunityMemberMapper';
import { ICommunityMemberRepository } from "../../../Domain/repositories/communities/ICommunityMemberRepository";


export class CommunityMemberRepository extends BaseRepository implements ICommunityMemberRepository
{
async getMemberCount(id: number): Promise<number | null>
      {
         return this.executeScalar
         ('SELECT COUNT(*) FROM community_members WHERE community_id = ?',[id]) ?? 0;
      }
      async getMember(userId: number, communityId: number): Promise<CommunityMember | null>
      {
            return this.executeReadOne(
                `SELECT ${COMMUNITY_MEMBER_FIELDS} 
                FROM community_members 
                WHERE user_id = ? AND community_id = ?`,
                [userId,communityId],mapCommunityMember)
      }
      async getMembers(communityId:number): Promise<CommunityMember[]>
      {
       return this.executeRead(
        `SELECT ${COMMUNITY_MEMBER_FIELDS} 
        FROM community_members 
        WHERE community_id = ?`
        ,[communityId],mapCommunityMember);
              
      }

      async getMemberUserIds(communityId: number): Promise<number[]> {
       return this.executeRead(
            `SELECT user_id
            FROM community_members
            WHERE community_id = ?`,
            [communityId],Number);    

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