import { NOTFOUND } from "node:dns";
import { CommunityDto } from "../../Domain/DTOs/users/CommunityDto";
import { CommunityMemberDto } from "../../Domain/DTOs/users/CommunityMemberDto";
import { Community } from "../../Domain/models/Community";
import { ICommunityRepository } from "../../Domain/repositories/communities/ICommunityRepository";
import { ICommunityService } from "../../Domain/services/communities/ICommunityService";
import { CreateCommunityInput, DeleteCommunityInput, GetCommunityByIdInput, GetUserCommunitiesInput, JoinCommunityInput, LeaveCommunityInput, UpdateCommunityInput } from "../../Domain/types/inputs/CommunityInputs";
import { ServiceResult } from "../../Domain/types/ServiceResult";
import { validateCreateCommunity } from "../../WebAPI/validators/CommunityValidator";
import { ErrorCode } from "../../Domain/enums/ErrorCode";

export class CommunityService implements ICommunityService{
 public constructor(private communityRepository: ICommunityRepository) {}

    async createCommunity(input:CreateCommunityInput): Promise<ServiceResult<CommunityDto>>
    {
        //ValidationResult vr= validateCreateCommunity();
         /*const community = await this.communityRepository.create();
                if (community.id === 0) {
                    return { success: false, message: 'Community not found', statusCode: 404 };
                }
                return {
                    success: true,
                    data: new CommunityDto(community.id,community.communityName, community.description,community.rules,community.communityType,community.icon,community.creatorId,0,community.createdAt ),
                };
                */
    }
    async getCommunityById(input: GetCommunityByIdInput): Promise<ServiceResult<CommunityDto>>
    {
         const community = await this.communityRepository.getById(input.id);
                if (community.id === 0) {
                    return { success: false, message: 'Community not found', errorCode: ErrorCode.NOT_FOUND };
                }
                return {
                    success: true,
                    data: new CommunityDto(community.id,community.communityName, community.description,community.rules,community.communityType,community.icon,community.creatorId,0,community.createdAt ),
                };
    }
    async getAllCommunities(): Promise<ServiceResult<CommunityDto[]>>
    {
                const communities: Community[] = await this.communityRepository.getAll();
                return {
                    success: true,
                    data: communities.map(c => new CommunityDto(c.id, c.communityName, c.description, c.rules, c.communityType, c.icon, c.creatorId,communities.length ,c.createdAt)),
                };
    }
    async getPublicCommunities(): Promise<ServiceResult<CommunityDto[]>>
    {
                        const communities: Community[] = await this.communityRepository.getPublic();
                return {
                    success: true,
                    data: communities.map(c => new CommunityDto(c.id, c.communityName, c.description, c.rules, c.communityType, c.icon, c.creatorId,communities.length ,c.createdAt)),
                };
    }
    async getUserCommunities(input: GetUserCommunitiesInput): Promise<ServiceResult<CommunityDto[]>>
    {
                                const communities: Community[] = await this.communityRepository.getByUserId(input.userId);
                return {
                    success: true,
                    data: communities.map(c => new CommunityDto(c.id, c.communityName, c.description, c.rules, c.communityType, c.icon, c.creatorId,communities.length ,c.createdAt)),
                };
    }
    async updateCommunity(input:UpdateCommunityInput): Promise<ServiceResult<CommunityDto>>
        {
                    const community: Community = await this.communityRepository.update(new Community());
            
                    if(community.id==0)return{
                        success: false,
                        message: 'Community not found',
                        errorCode: ErrorCode.NOT_FOUND
                    };
                    
                    

        }
    async deleteCommunity(input:DeleteCommunityInput): Promise<ServiceResult<boolean>>
    {
        const deleted: boolean = await this.communityRepository.delete(input.id);

        if(deleted == false) return 
        {

        }


    }
    async joinCommunity(input:JoinCommunityInput): Promise<ServiceResult<boolean>>
    {

    }
    async leaveCommunity(input: LeaveCommunityInput): Promise<ServiceResult<boolean>>
    {

    }

}