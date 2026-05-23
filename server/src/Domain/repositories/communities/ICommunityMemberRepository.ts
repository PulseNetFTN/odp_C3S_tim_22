import { Community } from "../../models/Community";
import { CommunityMember } from "../../models/CommunityMember";
import { UserRole } from "../../enums/UserRole";
import { CommunityRole } from '../../../Domain/enums/CommunityRole';

export interface ICommunityMemberRepository
{
      getMemberCount(communityId: number): Promise<number | null>;
      getMember(userId: number, communityId: number): Promise<CommunityMember | null>;
      getMembers(communityId:number): Promise<CommunityMember[]>;
      getMemberUserIds(communityId:number): Promise<number[]>;
      addMember(userId: number, communityId: number, role: CommunityRole, status: string): Promise<boolean>
      updateMemberRole(userId: number, communityId: number, role: CommunityRole): Promise<boolean>
      updateMemberStatus(userId:number,communityId:number, status:string) : Promise<boolean>;
      removeMember(userId:number,communityId:number): Promise<boolean>;

}