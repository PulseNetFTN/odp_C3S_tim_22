import { CommunityRole } from '../../enums/CommunityRole';
import { CommunityType } from '../../enums/CommunityType';

export type CreateCommunityInput = {
    name: string;
    description: string | null;
    rules: string | null;
    avatar: string | null;
    type: CommunityType;
    creatorId: number;
};

export type GetCommunityByIdInput = {
    communityId: number;
};

export type GetUserCommunitiesInput = {
    userId: number;
};

export type SearchCommunitiesInput = {
    query: string;
};

export type UpdateCommunityInput = {
    communityId: number;
    requesterId: number;
    name: string;
    description: string | null;
    rules: string | null;
    avatar: string | null;
    type: CommunityType;
};

export type DeleteCommunityInput = {
    communityId: number;
    requesterId: number;
};

export type JoinCommunityInput = {
    userId: number;
    communityId: number;
};

export type LeaveCommunityInput = {
    userId: number;
    communityId: number;
};

export type GetCommunityMembersInput = {
    communityId: number;
};

export type UpdateCommunityMemberRoleInput = {
    communityId: number;
    targetUserId: number;
    requesterId: number;
    role: CommunityRole;
};

export type UpdateCommunityMemberStatusInput = {
    communityId: number;
    targetUserId: number;
    requesterId: number;
    status: string;
};

export type RemoveCommunityMemberInput = {
    communityId: number;
    targetUserId: number;
    requesterId: number;
};