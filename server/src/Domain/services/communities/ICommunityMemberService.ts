import { CommunityDto } from "../../DTOs/community/CommunityDto";
import { CommunityMemberDto } from "../../DTOs/community/CommunityMemberDto";
import { GetCommunityMembersInput, RemoveCommunityMemberInput, UpdateCommunityMemberRoleInput, UpdateCommunityMemberStatusInput } from "../../types/inputs/CommunityInputs";
import { ServiceResult } from "../../types/ServiceResult";


export interface ICommunityMemberService {
    getMembers(input: GetCommunityMembersInput): Promise<ServiceResult<CommunityMemberDto[]>>;
    updateMemberRole(input: UpdateCommunityMemberRoleInput): Promise<ServiceResult<boolean>>;
    updateMemberStatus(input: UpdateCommunityMemberStatusInput): Promise<ServiceResult<boolean>>;
    removeMember(input: RemoveCommunityMemberInput): Promise<ServiceResult<boolean>>;
    }