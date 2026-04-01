import { Community } from "../../models/Community";

export interface ICommunityRepository
{
      create(communityName: Community): Promise<Community>;
      getById(id: number): Promise<Community>;
      getByCommunityName(communityName: string): Promise<Community>;
      getAll(): Promise<Community[]>;
      update(Community: Community): Promise<Community>;
      updateType(id: number, CommunityType: string): Promise<boolean>;
      delete(id: number): Promise<boolean>;
      exists(id: number): Promise<boolean>;
      searchByCommunityName(query: string): Promise<Community[]>;
      getCommunityFollowers(id: number): Promise<Community[]>;
      
      banUser(userId: number): Promise<boolean>; //??
}