export interface UserDto {
    id: number;
    username: string;
    email: string;
    firstName: string;
    lastName: string;
    bio: string | null;
    profileImage: string | null;
    role: string;
}

export interface AdminUserDto {
    id: number;
    username: string;
    email: string;
    firstName: string;
    lastName: string;
    bio: string | null;
    profileImage: string | null;
    role: string;
}

export interface UserProfileDto {
    id: number;
    username: string;
    email: string;
    firstName: string;
    lastName: string;
    bio: string | null;
    profileImage: string | null;
    role: string;
    createdAt: string;
    stats: {
        postCount: number;
        commentCount: number;
        followerCount: number;
        followingCount: number;
    };
    isFollowing?: boolean;
}

export interface UserPostDto {
    id: number;
    title: string;
    content: string;
    communityId: number;
    communityName: string;
    likeCount: number;
    commentCount: number;
    createdAt: string;
}

export interface UserCommentDto {
    id: number;
    content: string;
    postId: number;
    postTitle: string;
    createdAt: string;
}

export interface UserActivityDto {
    id: number;
    type: 'created_post' | 'commented' | 'followed';
    description: string;
    targetId: number;
    targetName: string;
    createdAt: string;
}

export interface UpdateProfileDto {
    firstName: string;
    lastName: string;
    email: string;
    bio: string | null;
    profileImage: string | null;
    username?: string;
}

export interface UserCommunityDto {
    id: number;
    name: string;
    avatar: string | null;
    role: 'moderator' | 'member';
    memberCount: number;
}