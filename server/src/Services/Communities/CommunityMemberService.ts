import { CommunityMemberDto } from "../../Domain/DTOs/users/CommunityMemberDto";
import { ICommunityRepository } from "../../Domain/repositories/users/ICommunityRepository";
import { ICommunityMemberService } from "../../Domain/services/communities/ICommunityMemberService";
import { GetCommunityMembersInput, UpdateCommunityMemberRoleInput, UpdateCommunityMemberStatusInput, RemoveCommunityMemberInput } from "../../Domain/types/inputs/CommunityInputs";
import { ServiceResult } from "../../Domain/types/ServiceResult";



export class CommunityMemberService implements ICommunityMemberService{
 public constructor(private communityRepository: ICommunityRepository) {}
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
         const result = await this.communityRepository.removeMember(input.targetUserId,input.communityId);
        if (!result) {
            return { success: false, message: 'Failed', statusCode: 400 };
        }
        return { success: true}; //gde ide requester id
    }


}