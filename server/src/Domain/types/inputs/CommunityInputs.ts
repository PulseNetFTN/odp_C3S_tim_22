import { CommunityType } from "../../enums/CommunityType";
import { UserRole } from "../../enums/UserRole";

export type GetCommunityMembersInput = {
    communityId: number;
}
export type UpdateCommunityMemberRoleInput = {
    communityId: number;
    targetUserId: number;
    requesterId: number;
    role: UserRole;
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

export type CreateCommunityInput = {
    name: string;
    description: string | null;
    rules: string | null;
    avatar: string | null;
    type: CommunityType;
    creatorId: number;
}

export type GetCommunityByIdInput= {
    id: number;
}

export type GetUserCommunitiesInput = {
    userId: number;
}

export type UpdateCommunityInput = {
    id: number;
    requesterId: number;
    name: string;
    description: string | null;
    rules: string | null;
    avatar: string | null;
    type: 'public' | 'private';
}
export type DeleteCommunityInput = {
    id: number;
    requesterId: number;
}

export type JoinCommunityInput = {
    userId: number;
    communityId: number;
}

export type LeaveCommunityInput = {
    userId: number;
    communityId: number;
}