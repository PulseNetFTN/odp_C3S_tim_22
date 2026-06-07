import { CommunityRole } from '../../enums/CommunityRole';
import { CommunityType } from '../../enums/CommunityType';
import { UserRole } from '../../enums/UserRole';

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
    requesterRole: UserRole;
    name: string;
    description: string | null;
    rules: string | null;
    avatar: string | null;
    type: CommunityType;
};

export type DeleteCommunityInput = {
    communityId: number;
    requesterId: number;
    requesterRole: UserRole;
};

export type JoinCommunityInput = {
    userId: number;
    communityId: number;
};

export type LeaveCommunityInput = {
    userId: number;
    communityId: number;
    requesterRole: UserRole;
};

export type GetCommunityMembersInput = {
    communityId: number;
};

export type UpdateCommunityMemberRoleInput = {
    communityId: number;
    targetUserId: number;
    requesterId: number;
    requesterRole: UserRole;
    role: CommunityRole;
};

export type UpdateCommunityMemberStatusInput = {
    communityId: number;
    targetUserId: number;
    requesterId: number;
    requesterRole: UserRole;
    status: string;
};

export type RemoveCommunityMemberInput = {
    communityId: number;
    targetUserId: number;
    requesterId: number;
    requesterRole: UserRole;
};