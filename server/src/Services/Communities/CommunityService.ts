import { CommunityDto } from "../../Domain/DTOs/users/CommunityDto";
import { CommunityMemberDto } from "../../Domain/DTOs/users/CommunityMemberDto";
import { Community } from "../../Domain/models/Community";
import { ICommunityRepository } from "../../Domain/repositories/users/ICommunityRepository";
import { ICommunityService } from "../../Domain/services/communities/ICommunityService";
import { ServiceResult } from "../../Domain/types/ServiceResult";
import { validateCreateCommunity } from "../../WebAPI/validators/CommunityValidator";

export class CommunityService implements ICommunityService{
 public constructor(private communityRepository: ICommunityRepository) {}

    async createCommunity(name: string, description: string | null, rules: string | null, avatar: string | null, type: 'public' | 'private', creatorId: number): Promise<ServiceResult<CommunityDto>>
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
    async getCommunityById(id: number): Promise<ServiceResult<CommunityDto>>
    {
         const community = await this.communityRepository.getById(id);
                if (community.id === 0) {
                    return { success: false, message: 'Community not found', statusCode: 404 };
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
    async getUserCommunities(userId: number): Promise<ServiceResult<CommunityDto[]>>
    {
                                const communities: Community[] = await this.communityRepository.getByUserId(userId);
                return {
                    success: true,
                    data: communities.map(c => new CommunityDto(c.id, c.communityName, c.description, c.rules, c.communityType, c.icon, c.creatorId,communities.length ,c.createdAt)),
                };
    }
    async updateCommunity(
        id: number,
        requesterId: number,
        name: string, 
        description: string | null, 
        rules: string | null, 
        avatar: string | null, 
        communityTypeType: 'public' | 'private'): Promise<ServiceResult<CommunityDto>>
        {
                    const community: Community = await this.communityRepository.update(new Community());
            
                    if(community.id==0)return{
                        success: false,
                        message: 'Community not found'
                    };
                    

        }
    async deleteCommunity(id: number, requesterId: number): Promise<ServiceResult<boolean>>
    {

    }
    async joinCommunity(userId: number, communityId: number): Promise<ServiceResult<boolean>>
    {

    }
    async leaveCommunity(userId: number, communityId: number): Promise<ServiceResult<boolean>>
    {

    }

}