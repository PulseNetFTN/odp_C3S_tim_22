import { NOTFOUND } from "node:dns";
import { CommunityDto } from "../../Domain/DTOs/community/CommunityDto";
import { CommunityMemberDto } from "../../Domain/DTOs/community/CommunityMemberDto";
import { Community } from "../../Domain/models/Community";
import { ICommunityRepository } from "../../Domain/repositories/communities/ICommunityRepository";
import { ICommunityService } from "../../Domain/services/communities/ICommunityService";
import { 
    CreateCommunityInput,
    DeleteCommunityInput,
    GetCommunityByIdInput,
    GetUserCommunitiesInput,
    JoinCommunityInput,
    LeaveCommunityInput,
    UpdateCommunityInput
} from "../../Domain/types/inputs/CommunityInputs";
import { ServiceResult } from "../../Domain/types/ServiceResult";
import { ErrorCode } from "../../Domain/enums/ErrorCode";
import e from "cors";
import { ICommunityMemberRepository } from "../../Domain/repositories/communities/ICommunityMemberRepository";
import { create } from "node:domain";
import { UserRole } from "../../Domain/enums/UserRole";

export class CommunityService implements ICommunityService{
 public constructor(
    private communityRepository: ICommunityRepository, 
    private communityMemberRepository: ICommunityMemberRepository) {}

    async createCommunity(input:CreateCommunityInput): Promise<ServiceResult<CommunityDto>>
    {
        const newcommunity = await this.communityRepository.create(
            new Community(0, input.name, input.description,input.rules,input.type,input.avatar,input.creatorId)
        );

        if (!newcommunity) {
            return { success: false, message: 'Failed to create community', errorCode: ErrorCode.INTERNAL_ERROR };
        }

        

        const dto = await this.buildCommunityDto(newcommunity);
        return { success: true, data: dto };
                
    }
    async getCommunityById(input: GetCommunityByIdInput): Promise<ServiceResult<CommunityDto>>
    {
         const community = await this.communityRepository.getById(input.id);
                if (!community) {
                    return { success: false, message: 'Community not found', errorCode: ErrorCode.NOT_FOUND };
                }
                const dto = await this.buildCommunityDto(community);
                return {
                    success: true,
                    data: dto
                };
    }
    async getAllCommunities(): Promise<ServiceResult<CommunityDto[]>>
    {
                const communities: Community[] = await this.communityRepository.getAll();
                return {
                    success: true,
                    data: communities.map(c => this.buildCommunityDto(c)),
                };
    }
    async getPublicCommunities(): Promise<ServiceResult<CommunityDto[]>>
    {
                        const communities: Community[] = await this.communityRepository.getPublic();
                return {
                    success: true,
                    data: communities.map(c => this.buildCommunityDto(c))
                };
    }
    async getUserCommunities(input: GetUserCommunitiesInput): Promise<ServiceResult<CommunityDto[]>>
    {
                                const communities: Community[] = await this.communityRepository.getByUserId(input.userId);
                return {
                    success: true,
                    data: communities.map(c => this.buildCommunityDto(c))
                };
    }
    async updateCommunity(input:UpdateCommunityInput): Promise<ServiceResult<CommunityDto>>
        {
                    const community = await this.communityRepository.update(new Community());
            
                    if(!community)return{
                        success: false,
                        message: 'Community not found',
                        errorCode: ErrorCode.NOT_FOUND
                        } 
                    
                    return {
                       success: true,
                       data: this.buildCommunityDto(community)
                    }
                    
                    

        }
    async deleteCommunity(input:DeleteCommunityInput): Promise<ServiceResult<boolean>>
    {
        const deleted = await this.communityRepository.delete(input.id);

        if(!deleted) return{
            success: false,
            message:'Community not found',
            errorCode: ErrorCode.NOT_FOUND
        } 
       
        return{
            success: true,
            data: deleted
        }

    }
    async joinCommunity(input:JoinCommunityInput): Promise<ServiceResult<boolean>>
    {
        const did = await this.communityMemberRepository.addMember(input.userId, input.communityId,UserRole.User,'pending');
        if(!did) return{
            success:false,
            message: 'Community join unsuccessful',
            errorCode: ErrorCode.INTERNAL_ERROR   
        }
        return {
            success: true,
            data: did
        }
    }
    async leaveCommunity(input: LeaveCommunityInput): Promise<ServiceResult<boolean>>
    {
        const did = await this.communityMemberRepository.removeMember(input.userId, input.communityId);
        if(!did) return{
            success:false,
            message: 'Community member not found',
            errorCode: ErrorCode.NOT_FOUND   
        }
        return {
            success: true,
            data: did
        }
    }

        private buildCommunityDto(com: Community): CommunityDto  {
            //const count = (this.communityMemberRepository.getMemberCount(com.id) ?? 0);// PROBLEM OVDE 

        return new CommunityDto(com.id,com.communityName,com.description,com.rules,com.communityType,com.icon, com.creatorId,/*count*/0,com.createdAt);
    }
}