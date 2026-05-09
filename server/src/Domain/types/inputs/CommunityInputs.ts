export type GetCommunityMembersInput = {
    communityId: number;
}
export type UpdateCommunityMemberRoleInput = {
    communityId: number;
    targetUserId: number;
    requesterId: number;
    role: string;
}

export type UpdateCommunityMemberStatusInput = {
    communityId: number; 
    targetUserId: number; 
    requesterId: number; 
    status: string;

}

export type RemoveCommunityMemberInput = {
    communityId: number;
    targetUserId: number;
    requesterId: number;
}