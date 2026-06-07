export type UpdateProfileInput = {
    userId: number;
    username: string;
    email: string;
    firstName: string;
    lastName: string;
    bio?: string;
    profileImage?: string;
    password?: string;
    currentPassword?: string;
};

export type UpdateRoleInput = {
    userId: number;
    role: string;
};

export type SearchUsersInput = {
    query: string;
};

export type GetUserInput = {
    userId: number;
};

export type FollowUserInput = {
    followerId: number;
    followingId: number;
};

export type UnfollowUserInput = {
    followerId: number;
    followingId: number;
};

export type RemoveFollowerInput = {
    followerId: number;
    userId: number;
};

export type GetFollowersInput = {
    userId: number;
};

export type GetFollowingInput = {
    userId: number;
};
