import { Community } from "../../models/Community";
import { CommunityMember } from "../../models/CommunityMember";
import { UserRole } from "../../enums/UserRole";



export interface ICommunityRepository
{
      create(communityName: Community): Promise<Community>;
      getById(id: number): Promise<Community>;
      getAll(): Promise<Community[]>;
      getPublic(): Promise<Community[]>;
      getByUserId(userId: number):Promise<Community[]>;
      update(communityName: Community): Promise<Community>;
      delete(id: number): Promise<boolean>;
      getMemberCount(communityId: number): Promise<number>;
      getMember(userId: number, communityId: number): Promise<CommunityMember>;
      getMembers(communityId:number): Promise<CommunityMember[]>;
      getMemberUserIds(communityId:number): Promise<number[]>;
      addMember(userId: number, communityId: number, userRole:UserRole, status:string): Promise<boolean>;
      updateMemberRole(userId:number,communityId:number,userRole:UserRole) : Promise<boolean>;
      updateMemberStatus(userId:number,communityId:number, status:string) : Promise<boolean>;
      removeMember(userId:number,communityId:number): Promise<boolean>;

      
}