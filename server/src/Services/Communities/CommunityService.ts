import { CommunityDto } from '../../Domain/DTOs/community/CommunityDto';
import { Community } from '../../Domain/models/Community';
import { ErrorCode } from '../../Domain/enums/ErrorCode';
import { CommunityRole } from '../../Domain/enums/CommunityRole';
import { UserRole } from '../../Domain/enums/UserRole';
import { ICommunityRepository } from '../../Domain/repositories/communities/ICommunityRepository';
import { ICommunityMemberRepository } from '../../Domain/repositories/communities/ICommunityMemberRepository';
import { IAuditService } from '../../Domain/services/audit/IAuditService';
import { ICommunityService } from '../../Domain/services/communities/ICommunityService';
import { ServiceResult } from '../../Domain/types/ServiceResult';
import {
    CreateCommunityInput,
    DeleteCommunityInput,
    GetCommunityByIdInput,
    GetUserCommunitiesInput,
    JoinCommunityInput,
    LeaveCommunityInput,
    UpdateCommunityInput,
    SearchCommunitiesInput,
} from '../../Domain/types/inputs/CommunityInputs';

export class CommunityService implements ICommunityService {
    public constructor(
        private communityRepository: ICommunityRepository,
        private communityMemberRepository: ICommunityMemberRepository,
        private auditService: IAuditService
    ) {}

    async createCommunity(input: CreateCommunityInput): Promise<ServiceResult<CommunityDto>> {
        const existing = await this.communityRepository.searchByName(input.name);
        if (existing.some(c => c.name.toLowerCase() === input.name.toLowerCase())) {
            return { success: false, message: 'Community name already taken', errorCode: ErrorCode.ALREADY_EXISTS };
        }

        const communityResult = await this.communityRepository.create(
            new Community(0, input.name, input.description, input.rules, input.type, input.avatar, input.creatorId)
        );

        if (!communityResult.ok) {
            return { success: false, message: 'Failed to create community', errorCode: ErrorCode.INTERNAL_ERROR };
        }

        const community = communityResult.data;

        const memberAdded = await this.communityMemberRepository.addMember(
            input.creatorId, community.id, CommunityRole.Moderator, 'active'
        );

        if (!memberAdded) {
            await this.communityRepository.delete(community.id);
            return { success: false, message: 'Failed to create community', errorCode: ErrorCode.INTERNAL_ERROR };
        }        

        const dto = await this.buildCommunityDto(community);
        return { success: true, data: dto };
    }

    async getCommunityById(input: GetCommunityByIdInput): Promise<ServiceResult<CommunityDto>> {
        const result = await this.communityRepository.getById(input.communityId);
        if (!result.ok) {
            return { success: false, message: 'Community not found', errorCode: ErrorCode.NOT_FOUND };
        }
        const dto = await this.buildCommunityDto(result.data);
        return { success: true, data: dto };
    }

    async getAllCommunities(): Promise<ServiceResult<CommunityDto[]>> {
        const communities = await this.communityRepository.getAll();
        const dtos = await this.buildCommunityDtos(communities);
        return { success: true, data: dtos };
    }

    async getPublicCommunities(): Promise<ServiceResult<CommunityDto[]>> {
        const communities = await this.communityRepository.getPublic();
        const dtos = await this.buildCommunityDtos(communities);
        return { success: true, data: dtos };
    }

    async getUserCommunities(input: GetUserCommunitiesInput): Promise<ServiceResult<CommunityDto[]>> {
        const communities = await this.communityRepository.getByUserId(input.userId);
        const dtos = await this.buildCommunityDtos(communities);
        return { success: true, data: dtos };
    }

    async searchCommunities(input: SearchCommunitiesInput): Promise<ServiceResult<CommunityDto[]>> {
        const communities = await this.communityRepository.searchByName(input.query);
        const dtos = await this.buildCommunityDtos(communities);
        return { success: true, data: dtos };
    }

    async updateCommunity(input: UpdateCommunityInput): Promise<ServiceResult<CommunityDto>> {
        const existingResult = await this.communityRepository.getById(input.communityId);
        if (!existingResult.ok) {
            return { success: false, message: 'Community not found', errorCode: ErrorCode.NOT_FOUND };
        }
        const existing = existingResult.data;

        const isAdmin = input.requesterRole === UserRole.Admin;
        if (!isAdmin) {
            const memberResult = await this.communityMemberRepository.getMember(input.requesterId, input.communityId);
            if (!memberResult.ok || memberResult.data.role !== CommunityRole.Moderator) {
                return { success: false, message: 'Only moderators can update the community', errorCode: ErrorCode.FORBIDDEN };
            }
        }

        const updateResult = await this.communityRepository.update(
            new Community(input.communityId, input.name, input.description, input.rules, input.type, input.avatar, existing.creatorId, existing.createdAt)
        );

        if (!updateResult.ok) {
            return { success: false, message: 'Update failed', errorCode: ErrorCode.INTERNAL_ERROR };
        }

        const dto = await this.buildCommunityDto(updateResult.data);
        return { success: true, data: dto };
    }

    async deleteCommunity(input: DeleteCommunityInput): Promise<ServiceResult<boolean>> {
        const existingResult = await this.communityRepository.getById(input.communityId);
        if (!existingResult.ok) {
            return { success: false, message: 'Community not found', errorCode: ErrorCode.NOT_FOUND };
        }
        const existing = existingResult.data;

        const isAdmin = input.requesterRole === UserRole.Admin;
        if (!isAdmin) {
            const memberResult = await this.communityMemberRepository.getMember(input.requesterId, input.communityId);
            if (!memberResult.ok || memberResult.data.role !== CommunityRole.Moderator) {
                return { success: false, message: 'Only moderators can delete the community', errorCode: ErrorCode.FORBIDDEN };
            }
        }

        const memberCount = await this.communityMemberRepository.getMemberCount(input.communityId);

        const result = await this.communityRepository.delete(input.communityId);
        if (!result) {
            return { success: false, message: 'Delete failed', errorCode: ErrorCode.INTERNAL_ERROR };
        }

        await this.auditService.log({
            userId: input.requesterId,
            action: 'COMMUNITY_DELETED',
            entityType: 'community',
            entityId: input.communityId,
            details: JSON.stringify({ name: existing.name, memberCount }),
        });

        return { success: true, data: true };
    }

    async joinCommunity(input: JoinCommunityInput): Promise<ServiceResult<boolean>> {
        const communityResult = await this.communityRepository.getById(input.communityId);
        if (!communityResult.ok) {
            return { success: false, message: 'Community not found', errorCode: ErrorCode.NOT_FOUND };
        }

        const existingMember = await this.communityMemberRepository.getMember(input.userId, input.communityId);
        if (existingMember.ok) {
            return { success: false, message: 'Already a member or request pending', errorCode: ErrorCode.ALREADY_EXISTS };
        }

        const status = communityResult.data.type === 'private' ? 'pending' : 'active';

        const result = await this.communityMemberRepository.addMember(
            input.userId, input.communityId, CommunityRole.Member, status
        );

        if (!result) {
            return { success: false, message: 'Failed to join community', errorCode: ErrorCode.INTERNAL_ERROR };
        }

        return { success: true, data: true };
    }

    async leaveCommunity(input: LeaveCommunityInput): Promise<ServiceResult<boolean>> {
        const memberResult = await this.communityMemberRepository.getMember(input.userId, input.communityId);
        if (!memberResult.ok) {
            return { success: false, message: 'You are not a member of this community', errorCode: ErrorCode.NOT_FOUND };
        }

        const isAdmin = input.requesterRole === UserRole.Admin;
        if (!isAdmin && memberResult.data.role === CommunityRole.Moderator) {
            return { success: false, message: 'Moderators cannot leave. Transfer ownership first.', errorCode: ErrorCode.FORBIDDEN };
        }

        const result = await this.communityMemberRepository.removeMember(input.userId, input.communityId);
        if (!result) {
            return { success: false, message: 'Failed to leave community', errorCode: ErrorCode.INTERNAL_ERROR };
        }

        return { success: true, data: true };
    }

    private async buildCommunityDtos(communities: Community[]): Promise<CommunityDto[]> {
        if (communities.length === 0) return [];
        const ids = communities.map(c => c.id);
        const countMap = await this.communityMemberRepository.getMemberCountBatch(ids);
        return communities.map(c => new CommunityDto(
            c.id, c.name, c.description, c.rules,
            c.type, c.avatar, c.creatorId,
            countMap.get(c.id) ?? 0, c.createdAt
        ));
    }

    private async buildCommunityDto(community: Community): Promise<CommunityDto> {
        const memberCount = await this.communityMemberRepository.getMemberCount(community.id);
        return new CommunityDto(
            community.id, community.name, community.description, community.rules,
            community.type, community.avatar, community.creatorId,
            memberCount, community.createdAt
        );
    }
}
