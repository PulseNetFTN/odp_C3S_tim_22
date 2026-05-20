import { Community } from "../../models/Community";

export interface ICommunityRepository
{
      create(communityName: Community): Promise<Community|null>;
      getById(id: number): Promise<Community | null>;
      getByIds(ids: number[]): Promise<Community[]>
      getAll(): Promise<Community[]>;
      getPublic(): Promise<Community[]>;
      getByUserId(userId: number):Promise<Community[]>;
      update(communityName: Community): Promise<Community|null>;
      delete(id: number): Promise<boolean>;

      
}