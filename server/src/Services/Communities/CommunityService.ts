import { CommunityDto } from '../../Domain/DTOs/community/CommunityDto';
import { Community } from '../../Domain/models/Community';
import { ErrorCode } from '../../Domain/enums/ErrorCode';
import { CommunityRole } from '../../Domain/enums/CommunityRole';
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
        const community = await this.communityRepository.create(
            new Community(0, input.name, input.description, input.rules, input.type, input.avatar, input.creatorId)
        );

        if (!community) {
            return { success: false, message: 'Failed to create community', errorCode: ErrorCode.INTERNAL_ERROR };
        }

        await this.communityMemberRepository.addMember(
            input.creatorId, community.id, CommunityRole.Moderator, 'active'
        );

        const dto = await this.buildCommunityDto(community);
        return { success: true, data: dto };
    }

    async getCommunityById(input: GetCommunityByIdInput): Promise<ServiceResult<CommunityDto>> {
        const community = await this.communityRepository.getById(input.communityId);
        if (!community) {
            return { success: false, message: 'Community not found', errorCode: ErrorCode.NOT_FOUND };
        }
        const dto = await this.buildCommunityDto(community);
        return { success: true, data: dto };
    }

    async getAllCommunities(): Promise<ServiceResult<CommunityDto[]>> {
        const communities = await this.communityRepository.getAll();
        const dtos = await Promise.all(communities.map(c => this.buildCommunityDto(c)));
        return { success: true, data: dtos };
    }

    async getPublicCommunities(): Promise<ServiceResult<CommunityDto[]>> {
        const communities = await this.communityRepository.getPublic();
        const dtos = await Promise.all(communities.map(c => this.buildCommunityDto(c)));
        return { success: true, data: dtos };
    }

    async getUserCommunities(input: GetUserCommunitiesInput): Promise<ServiceResult<CommunityDto[]>> {
        const communities = await this.communityRepository.getByUserId(input.userId);
        const dtos = await Promise.all(communities.map(c => this.buildCommunityDto(c)));
        return { success: true, data: dtos };
    }

    async searchCommunities(input: SearchCommunitiesInput): Promise<ServiceResult<CommunityDto[]>> {
        const communities = await this.communityRepository.searchByName(input.query);
        const dtos = await Promise.all(communities.map(c => this.buildCommunityDto(c)));
        return { success: true, data: dtos };
    }

    async updateCommunity(input: UpdateCommunityInput): Promise<ServiceResult<CommunityDto>> {
        const existing = await this.communityRepository.getById(input.communityId);
        if (!existing) {
            return { success: false, message: 'Community not found', errorCode: ErrorCode.NOT_FOUND };
        }

        const member = await this.communityMemberRepository.getMember(input.requesterId, input.communityId);
        if (!member || member.role !== CommunityRole.Moderator) {
            return { success: false, message: 'Only moderators can update the community', errorCode: ErrorCode.FORBIDDEN };
        }

        const updated = await this.communityRepository.update(
           new Community(input.communityId, input.name, input.description, input.rules, input.type, input.avatar, existing.creatorId, existing.createdAt)
        );

        if (!updated) {
            return { success: false, message: 'Update failed', errorCode: ErrorCode.INTERNAL_ERROR };
        }

        const dto = await this.buildCommunityDto(updated);
        return { success: true, data: dto };
    }

    async deleteCommunity(input: DeleteCommunityInput): Promise<ServiceResult<boolean>> {
        const existing = await this.communityRepository.getById(input.communityId);
        if (!existing) {
            return { success: false, message: 'Community not found', errorCode: ErrorCode.NOT_FOUND };
        }

        const member = await this.communityMemberRepository.getMember(input.requesterId, input.communityId);
        if (!member || member.role !== CommunityRole.Moderator) {
            return { success: false, message: 'Only moderators can delete the community', errorCode: ErrorCode.FORBIDDEN };
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
            details: JSON.stringify({ name: existing.communityName, memberCount }),
        });

        return { success: true, data: true };
    }

    async joinCommunity(input: JoinCommunityInput): Promise<ServiceResult<boolean>> {
        const community = await this.communityRepository.getById(input.communityId);
        if (!community) {
            return { success: false, message: 'Community not found', errorCode: ErrorCode.NOT_FOUND };
        }

        const existing = await this.communityMemberRepository.getMember(input.userId, input.communityId);
        if (existing) {
            return { success: false, message: 'Already a member or request pending', errorCode: ErrorCode.ALREADY_EXISTS };
        }

        const status = community.communityType === 'private' ? 'pending' : 'active';

        const result = await this.communityMemberRepository.addMember(
            input.userId, input.communityId, CommunityRole.Member, status
        );

        if (!result) {
            return { success: false, message: 'Failed to join community', errorCode: ErrorCode.INTERNAL_ERROR };
        }

        return { success: true, data: true };
    }

    async leaveCommunity(input: LeaveCommunityInput): Promise<ServiceResult<boolean>> {
        const member = await this.communityMemberRepository.getMember(input.userId, input.communityId);
        if (!member) {
            return { success: false, message: 'You are not a member of this community', errorCode: ErrorCode.NOT_FOUND };
        }

        if (member.role === CommunityRole.Moderator) {
            return { success: false, message: 'Moderators cannot leave. Transfer ownership first.', errorCode: ErrorCode.FORBIDDEN };
        }

        const result = await this.communityMemberRepository.removeMember(input.userId, input.communityId);
        if (!result) {
            return { success: false, message: 'Failed to leave community', errorCode: ErrorCode.INTERNAL_ERROR };
        }

        return { success: true, data: true };
    }

    private async buildCommunityDto(community: Community): Promise<CommunityDto> {
        const memberCount = await this.communityMemberRepository.getMemberCount(community.id);
        return new CommunityDto(
            community.id, community.communityName, community.description, community.rules,
            community.communityType, community.icon, community.creatorId,
            memberCount ?? 0, community.createdAt
        );
    }
}