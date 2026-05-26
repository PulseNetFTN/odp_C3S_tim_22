// src/api_services/users/UserProfileAPIService.ts
import { apiGet, apiPost, apiPut, apiDelete } from '../../helpers/api';
import type { ApiResponse } from '../../helpers/api';
import type { CommentDto } from '../../models/comments/CommentDTO';
import type { UserProfileDto, UserActivityDto, UpdateProfileDto, UserCommunityDto, UserDto } from '../../models/users/UserDto';
import type { PostDto } from '../../models/posts/PostsDto';

export const UserProfileAPIService = {
    getUserProfile: (userId: number): Promise<ApiResponse<UserProfileDto>> =>
        apiGet<UserProfileDto>(`users/${userId}`),

    getMyProfile: (): Promise<ApiResponse<UserProfileDto>> =>
        apiGet<UserProfileDto>(`users/me`),

    updateProfile: (_token: string, data: UpdateProfileDto): Promise<ApiResponse<UserProfileDto>> =>
        apiPut<UserProfileDto>(`users/me`, data),

    followUser: (_token: string, userId: number): Promise<ApiResponse<boolean>> =>
        apiPost<boolean>(`users/${userId}/follow`),

    unfollowUser: (_token: string, userId: number): Promise<ApiResponse<boolean>> =>
        apiDelete<boolean>(`users/${userId}/follow`),

    getUserFollowers: (userId: number): Promise<ApiResponse<UserDto[]>> =>
        apiGet<UserDto[]>(`users/${userId}/followers`),

    getUserFollowing: (userId: number): Promise<ApiResponse<UserDto[]>> =>
        apiGet<UserDto[]>(`users/${userId}/following`),

    removeFollower: (followerId: number): Promise<ApiResponse<boolean>> =>
        apiDelete<boolean>(`users/followers/${followerId}`),

    getUserCommunities: (): Promise<ApiResponse<UserCommunityDto[]>> =>
        apiGet<UserCommunityDto[]>(`users/me/communities`),

    getUserActivities: (_token: string, limit: number = 10): Promise<ApiResponse<UserActivityDto[]>> =>
        apiGet<UserActivityDto[]>(`users/me/activities?limit=${limit}`),

    getUserPosts: (userId: number): Promise<ApiResponse<PostDto[]>> =>
        apiGet<PostDto[]>(`posts/user/${userId}`),

    getUserComments: (userId: number): Promise<ApiResponse<CommentDto[]>> =>
        apiGet<CommentDto[]>(`comments/user/${userId}`),
};