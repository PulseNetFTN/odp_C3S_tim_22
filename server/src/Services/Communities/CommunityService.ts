import { CommunityDto } from "../../Domain/DTOs/users/CommunityDto";
import { CommunityMemberDto } from "../../Domain/DTOs/users/CommunityMemberDto";
import { ICommunityRepository } from "../../Domain/repositories/users/ICommunityRepository";
import { ICommunityService } from "../../Domain/services/communities/ICommunityService";
import { ServiceResult } from "../../Domain/types/ServiceResult";
import { validateCreateCommunity } from "../../WebAPI/validators/CommunityValidator";

export class CommunityService implements ICommunityService{
 public constructor(private communityRepository: ICommunityRepository) {}

    async createCommunity(name: string, description: string | null, rules: string | null, avatar: string | null, type: 'public' | 'private', creatorId: number): Promise<ServiceResult<CommunityDto>>
    {
        //validateCreateCommunity
    }
    async getCommunityById(id: number): Promise<ServiceResult<CommunityDto>>
    {
         const community = await this.userRepository.getById(id);
                if (user.id === 0) {
                    return { success: false, message: 'User not found', statusCode: 404 };
                }
                return {
                    success: true,
                    data: new UserDto(user.id, user.username, user.email, user.firstName, user.lastName, user.bio, user.profileImage, user.role),
                };
    }
    async getAllCommunities(): Promise<ServiceResult<CommunityDto[]>>;
    async getPublicCommunities(): Promise<ServiceResult<CommunityDto[]>>;
    async getUserCommunities(userId: number): Promise<ServiceResult<CommunityDto[]>>;
    async updateCommunity(
        id: number,
        requesterId: number,
        name: string, 
        description: string | null, 
        rules: string | null, 
        avatar: string | null, 
        communityTypeType: 'public' | 'private'): Promise<ServiceResult<CommunityDto>>;
    async deleteCommunity(id: number, requesterId: number): Promise<ServiceResult<boolean>>;
    async joinCommunity(userId: number, communityId: number): Promise<ServiceResult<boolean>>;
    async leaveCommunity(userId: number, communityId: number): Promise<ServiceResult<boolean>>;
    async getMembers(communityId: number): Promise<ServiceResult<CommunityMemberDto[]>>;
    async updateMemberRole(communityId: number, targetUserId: number, requesterId: number, role: string): Promise<ServiceResult<boolean>>;
    async updateMemberStatus(communityId: number, targetUserId: number, requesterId: number, status: string): Promise<ServiceResult<boolean>>;
    async removeMember(communityId: number, targetUserId: number, requesterId: number): Promise<ServiceResult<boolean>>;
}