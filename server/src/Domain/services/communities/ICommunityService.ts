import { CommunityDto } from '../../DTOs/community/CommunityDto';
import { ServiceResult } from '../../types/ServiceResult';
import {
    CreateCommunityInput,
    GetCommunityByIdInput,
    GetUserCommunitiesInput,
    SearchCommunitiesInput,
    UpdateCommunityInput,
    DeleteCommunityInput,
    JoinCommunityInput,
    LeaveCommunityInput,
} from '../../types/inputs/CommunityInputs';

export interface ICommunityService {
    createCommunity(input: CreateCommunityInput): Promise<ServiceResult<CommunityDto>>;
    getCommunityById(input: GetCommunityByIdInput): Promise<ServiceResult<CommunityDto>>;
    getAllCommunities(): Promise<ServiceResult<CommunityDto[]>>;
    getPublicCommunities(): Promise<ServiceResult<CommunityDto[]>>;
    getUserCommunities(input: GetUserCommunitiesInput): Promise<ServiceResult<CommunityDto[]>>;
    searchCommunities(input: SearchCommunitiesInput): Promise<ServiceResult<CommunityDto[]>>;
    updateCommunity(input: UpdateCommunityInput): Promise<ServiceResult<CommunityDto>>;
    deleteCommunity(input: DeleteCommunityInput): Promise<ServiceResult<boolean>>;
    joinCommunity(input: JoinCommunityInput): Promise<ServiceResult<boolean>>;
    leaveCommunity(input: LeaveCommunityInput): Promise<ServiceResult<boolean>>;
}