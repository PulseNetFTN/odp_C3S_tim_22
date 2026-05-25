export interface CommunityDto {
    id: number;
    name: string;
    description: string | null;
    rules: string | null;
    avatar: string | null;
    type: 'public' | 'private';
    creatorId: number;
    memberCount: number;
    createdAt: string | null;
}

export interface UserCommunityDto {
    id: number;
    name: string;
    avatar: string | null;
    role: 'moderator' | 'member';
    memberCount: number;
}

export interface UpdateProfileDto {
    firstName: string;
    lastName: string;
    email: string;
    bio: string | null;
    profileImage: string | null;
}