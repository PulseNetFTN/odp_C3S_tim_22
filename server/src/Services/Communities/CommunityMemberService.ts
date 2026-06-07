import { CommunityMemberDto } from '../../Domain/DTOs/community/CommunityMemberDto';
import { ErrorCode } from '../../Domain/enums/ErrorCode';
import { CommunityRole } from '../../Domain/enums/CommunityRole';
import { UserRole } from '../../Domain/enums/UserRole';
import { CommunityMember } from '../../Domain/models/CommunityMember';
import { ICommunityMemberRepository } from '../../Domain/repositories/communities/ICommunityMemberRepository';
import { IAuditService } from '../../Domain/services/audit/IAuditService';
import { ICommunityMemberService } from '../../Domain/services/communities/ICommunityMemberService';
import { ServiceResult } from '../../Domain/types/ServiceResult';
import {
    GetCommunityMembersInput,
    UpdateCommunityMemberRoleInput,
    UpdateCommunityMemberStatusInput,
    RemoveCommunityMemberInput,
} from '../../Domain/types/inputs/CommunityInputs';

export class CommunityMemberService implements ICommunityMemberService {
    public constructor(
        private communityMemberRepository: ICommunityMemberRepository,
        private auditService: IAuditService
    ) {}

    async getMembers(input: GetCommunityMembersInput): Promise<ServiceResult<CommunityMemberDto[]>> {
        const members = await this.communityMemberRepository.getMembers(input.communityId);
        return { success: true, data: members.map(m => this.buildCommunityMemberDto(m)) };
    }

    async updateMemberRole(input: UpdateCommunityMemberRoleInput): Promise<ServiceResult<boolean>> {
        const existingResult = await this.communityMemberRepository.getMember(input.targetUserId, input.communityId);
        if (!existingResult.ok) {
            return { success: false, message: 'Member not found', errorCode: ErrorCode.NOT_FOUND };
        }

        const isAdmin = input.requesterRole === UserRole.Admin;
        if (!isAdmin) {
            const requesterResult = await this.communityMemberRepository.getMember(input.requesterId, input.communityId);
            if (!requesterResult.ok || requesterResult.data.role !== CommunityRole.Moderator) {
                return { success: false, message: 'Only moderators can change roles', errorCode: ErrorCode.FORBIDDEN };
            }
        }

        const oldRole = existingResult.data.role;

        const result = await this.communityMemberRepository.updateMemberRole(input.targetUserId, input.communityId, input.role);
        if (!result) {
            return { success: false, message: 'Role update failed', errorCode: ErrorCode.INTERNAL_ERROR };
        }

        await this.auditService.log({
            userId: input.requesterId,
            action: 'MEMBER_ROLE_CHANGED',
            entityType: 'community_member',
            entityId: input.communityId,
            details: JSON.stringify({ targetUserId: input.targetUserId, oldRole, newRole: input.role }),
        });

        return { success: true, data: true };
    }

    async updateMemberStatus(input: UpdateCommunityMemberStatusInput): Promise<ServiceResult<boolean>> {
        const existingResult = await this.communityMemberRepository.getMember(input.targetUserId, input.communityId);
        if (!existingResult.ok) {
            return { success: false, message: 'Member not found', errorCode: ErrorCode.NOT_FOUND };
        }

        const isAdmin = input.requesterRole === UserRole.Admin;
        if (!isAdmin) {
            const requesterResult = await this.communityMemberRepository.getMember(input.requesterId, input.communityId);
            if (!requesterResult.ok || requesterResult.data.role !== CommunityRole.Moderator) {
                return { success: false, message: 'Only moderators can change member status', errorCode: ErrorCode.FORBIDDEN };
            }
        }

        const oldStatus = existingResult.data.status;

        const result = await this.communityMemberRepository.updateMemberStatus(input.targetUserId, input.communityId, input.status);
        if (!result) {
            return { success: false, message: 'Status update failed', errorCode: ErrorCode.INTERNAL_ERROR };
        }

        await this.auditService.log({
            userId: input.requesterId,
            action: 'MEMBER_STATUS_CHANGED',
            entityType: 'community_member',
            entityId: input.communityId,
            details: JSON.stringify({ targetUserId: input.targetUserId, oldStatus, newStatus: input.status }),
        });

        return { success: true, data: true };
    }

    async removeMember(input: RemoveCommunityMemberInput): Promise<ServiceResult<boolean>> {
        const existingResult = await this.communityMemberRepository.getMember(input.targetUserId, input.communityId);
        if (!existingResult.ok) {
            return { success: false, message: 'Member not found', errorCode: ErrorCode.NOT_FOUND };
        }

        const isAdmin = input.requesterRole === UserRole.Admin;
        if (!isAdmin) {
            const requesterResult = await this.communityMemberRepository.getMember(input.requesterId, input.communityId);
            if (!requesterResult.ok || requesterResult.data.role !== CommunityRole.Moderator) {
                return { success: false, message: 'Only moderators can remove members', errorCode: ErrorCode.FORBIDDEN };
            }
        }

        if (existingResult.data.role === CommunityRole.Moderator) {
            return { success: false, message: 'Cannot remove a moderator', errorCode: ErrorCode.FORBIDDEN };
        }

        const result = await this.communityMemberRepository.removeMember(input.targetUserId, input.communityId);
        if (!result) {
            return { success: false, message: 'Remove failed', errorCode: ErrorCode.INTERNAL_ERROR };
        }

        await this.auditService.log({
            userId: input.requesterId,
            action: 'MEMBER_REMOVED',
            entityType: 'community_member',
            entityId: input.communityId,
            details: JSON.stringify({ removedUserId: input.targetUserId }),
        });

        return { success: true, data: true };
    }

    private buildCommunityMemberDto(member: CommunityMember): CommunityMemberDto {
        return new CommunityMemberDto(
            member.userId,
            member.communityId,
            member.status,
            member.role,
            member.joinedAt
        );
    }
}
