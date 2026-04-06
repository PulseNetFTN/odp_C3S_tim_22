import { Community } from "../../models/Community";
import { CommunityMember } from "../../models/CommunityMember";
import { UserRole } from "../../enums/UserRole";



export interface ICommunityRepository
{
      create(communityName: Community): Promise<Community>;
      getById(id: number): Promise<Community>;
      getAll(): Promise<Community[]>;
      update(communityName: Community): Promise<Community>;
      updateType(id: number, CommunityType: string): Promise<boolean>;
      delete(id: number): Promise<boolean>;
      getCommunityFollowers(id: number): Promise<Community[]>;
      getMemberCount(id: number): Promise<number>;
      getMember(userId: number, communityId: number): Promise<CommunityMember>;
      getMembers(id: number, communittyId:number): Promise<CommunityMember[]>;
      addMember(userId: number, communityId: number, userRole:UserRole, status:string): Promise<boolean>;
      updateMemberRole(userId:number,communityId:number,userRole:UserRole) : Promise<boolean>;
      updateMemberStatus(userId:number,communityId:number, status:string) : Promise<boolean>;
      removeMember(userId:number,communittyId:number): Promise<boolean>;

      
}