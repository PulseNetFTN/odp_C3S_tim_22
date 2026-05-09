import { CommunityDto } from "../../DTOs/users/CommunityDto";
import { CommunityMemberDto } from "../../DTOs/users/CommunityMemberDto";
import { ServiceResult } from "../../types/ServiceResult";

export interface ICommunityService {
    createCommunity(name: string, 
        description: string | null, 
        rules: string | null, 
        avatar: string | null, 
        type: 'public' | 'private', 
        creatorId: number): Promise<ServiceResult<CommunityDto>>;
    getCommunityById(id: number): Promise<ServiceResult<CommunityDto>>;
    getAllCommunities(): Promise<ServiceResult<CommunityDto[]>>;
    getPublicCommunities(): Promise<ServiceResult<CommunityDto[]>>;
    getUserCommunities(userId: number): Promise<ServiceResult<CommunityDto[]>>;
    updateCommunity(
        id: number,
        requesterId: number,
        name: string, 
        description: string | null, 
        rules: string | null, 
        avatar: string | null, 
        type: 'public' | 'private'): Promise<ServiceResult<CommunityDto>>;
    deleteCommunity(id: number, requesterId: number): Promise<ServiceResult<boolean>>;
    joinCommunity(userId: number, communityId: number): Promise<ServiceResult<boolean>>;
    leaveCommunity(userId: number, communityId: number): Promise<ServiceResult<boolean>>;
   
}