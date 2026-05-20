import { CommunityDto } from "../../DTOs/community/CommunityDto";
import { CommunityMemberDto } from "../../DTOs/community/CommunityMemberDto";
import { CreateCommunityInput, DeleteCommunityInput, GetCommunityByIdInput, GetUserCommunitiesInput, JoinCommunityInput, LeaveCommunityInput, UpdateCommunityInput } from "../../types/inputs/CommunityInputs";
import { ServiceResult } from "../../types/ServiceResult";

export interface ICommunityService {
    createCommunity(input:CreateCommunityInput): Promise<ServiceResult<CommunityDto>>;
    getCommunityById(input: GetCommunityByIdInput): Promise<ServiceResult<CommunityDto>>;
    getAllCommunities(): Promise<ServiceResult<CommunityDto[]>>;
    getPublicCommunities(): Promise<ServiceResult<CommunityDto[]>>;
    getUserCommunities(input: GetUserCommunitiesInput): Promise<ServiceResult<CommunityDto[]>>;
    updateCommunity(input: UpdateCommunityInput): Promise<ServiceResult<CommunityDto>>;
    deleteCommunity(input:DeleteCommunityInput): Promise<ServiceResult<boolean>>;
    joinCommunity(input: JoinCommunityInput): Promise<ServiceResult<boolean>>;
    leaveCommunity(input:LeaveCommunityInput): Promise<ServiceResult<boolean>>;
   
}