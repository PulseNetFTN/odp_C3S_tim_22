import { CommunityMemberDto } from "../../Domain/DTOs/users/CommunityMemberDto";
import { ICommunityMemberService } from "../../Domain/services/communities/ICommunityMemberService";
import { GetCommunityMembersInput, UpdateCommunityMemberRoleInput, UpdateCommunityMemberStatusInput, RemoveCommunityMemberInput } from "../../Domain/types/inputs/CommunityInputs";
import { ServiceResult } from "../../Domain/types/ServiceResult"; 
import { ICommunityMemberRepository } from "../../Domain/repositories/communities/ICommunityMemberRepository";



export class CommunityMemberService implements ICommunityMemberService{
 public constructor(private communityMemberRepository: ICommunityMemberRepository) {}
    async getMembers(input: GetCommunityMembersInput): Promise<ServiceResult<CommunityMemberDto[]>> {
        throw new Error("Method not implemented.");
    }
    async updateMemberRole(input: UpdateCommunityMemberRoleInput): Promise<ServiceResult<boolean>> {
        throw new Error("Method not implemented.");
    }
    async updateMemberStatus(input: UpdateCommunityMemberStatusInput): Promise<ServiceResult<boolean>> {
        throw new Error("Method not implemented.");
    }
    async removeMember(input: RemoveCommunityMemberInput): Promise<ServiceResult<boolean>> {
         const result = await this.communityMemberRepository.removeMember(input.targetUserId,input.communityId);
        if (!result) {
            return { success: false, message: 'Failed'};
        }
        return { success: true}; //gde ide requester id
    }


}