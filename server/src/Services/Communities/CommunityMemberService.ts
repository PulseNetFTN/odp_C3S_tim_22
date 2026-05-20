import { CommunityMemberDto } from "../../Domain/DTOs/community/CommunityMemberDto";
import { ICommunityMemberService } from "../../Domain/services/communities/ICommunityMemberService";
import { 
    GetCommunityMembersInput, 
    UpdateCommunityMemberRoleInput, 
    UpdateCommunityMemberStatusInput, 
    RemoveCommunityMemberInput
 } from "../../Domain/types/inputs/CommunityInputs";
import { ServiceResult } from "../../Domain/types/ServiceResult"; 
import { ICommunityMemberRepository } from "../../Domain/repositories/communities/ICommunityMemberRepository";
import { CommunityMember } from "../../Domain/models/CommunityMember";
import { throws } from "assert";
import { ErrorCode } from "../../Domain/enums/ErrorCode";
import { ICommunityRepository } from "../../Domain/repositories/communities/ICommunityRepository";



export class CommunityMemberService implements ICommunityMemberService{
 public constructor(
    private communityMemberRepository: ICommunityMemberRepository,
    private communityRepository: ICommunityRepository){}

    async getMembers(input: GetCommunityMembersInput): Promise<ServiceResult<CommunityMemberDto[]>> {

        const members = await this.communityMemberRepository.getMembers(input.communityId);

        if(!members) return {success: false, message: 'No members found',errorCode: ErrorCode.NOT_FOUND}
        
        return {success: true, data: members.map(m => this.buildCommunityMemberDto(m))};
        
    }
    async updateMemberRole(input: UpdateCommunityMemberRoleInput): Promise<ServiceResult<boolean>> {
        const existing = await this.communityMemberRepository.getMember(input.targetUserId,input.communityId);
        if (!existing) {
            return { success: false, message: 'Member not found', errorCode: ErrorCode.NOT_FOUND };
        }
        const oldRole = existing.role;

        const result = await this.communityMemberRepository.updateMemberRole(input.targetUserId,input.communityId,input.role);
        if (!result) {
            return { success: false, message: 'Role update failed', errorCode: ErrorCode.INTERNAL_ERROR };
        }

        //audit

        return { success: true, data: true };        
    }
    async updateMemberStatus(input: UpdateCommunityMemberStatusInput): Promise<ServiceResult<boolean>> {
        const existing = await this.communityMemberRepository.getMember(input.targetUserId,input.communityId);
        if (!existing) {
            return { success: false, message: 'Member not found', errorCode: ErrorCode.NOT_FOUND };
        }

        const result = await this.communityMemberRepository.updateMemberStatus(input.targetUserId, input.communityId, input.status);
        if (!result) {
            return { success: false, message: 'Status update failed', errorCode: ErrorCode.INTERNAL_ERROR };
        }

            //audit
        return { success: true, data: true };        



    }
    async removeMember(input: RemoveCommunityMemberInput): Promise<ServiceResult<boolean>> {
         const result = await this.communityMemberRepository.removeMember(input.targetUserId,input.communityId);
        if (!result) {
            return { success: false, message: 'Failed'};
        }
        return { success: true}; //gde ide requester id vrv u audit 
    }

private buildCommunityMemberDto(member: CommunityMember):CommunityMemberDto{

        return new CommunityMemberDto(
            member.userId,
            member.communityId,
            member.status,
            member.role,
            member.joinedAt     
        );
    }
}