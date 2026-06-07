import { apiGet, apiPost, apiPut, apiDelete } from '../../helpers/api';
import type { ApiResponse } from '../../helpers/api';
import type { IPostApiService } from './IPostAPIService';
import type { PostDto } from '../../models/posts/PostsDto';

export const postApi: IPostApiService = {
    getPublicPosts(limit: number = 50): Promise<ApiResponse<PostDto[]>> {
        return apiGet<PostDto[]>(`posts/public?limit=${limit}`);
    },

    getFeed(): Promise<ApiResponse<PostDto[]>> {
        return apiGet<PostDto[]>('posts/feed');
    },

    getCommunityPosts(communityId: number, sort: string = 'newest'): Promise<ApiResponse<PostDto[]>> {
        return apiGet<PostDto[]>(`posts/community/${communityId}?sort=${sort}`);
    },

    getPostsByUser(userId: number): Promise<ApiResponse<PostDto[]>> {
        return apiGet<PostDto[]>(`posts/user/${userId}`);
    },    

    getById(id: number): Promise<ApiResponse<PostDto>> {
        return apiGet<PostDto>(`posts/${id}`);
    },

    create(data: { title: string; content: string; mediaUrl?: string; communityId: number; tagIds?: number[] }): Promise<ApiResponse<PostDto>> {
        return apiPost<PostDto>('posts', data);
    },

    update(id: number, data: { title: string; content: string; mediaUrl?: string }): Promise<ApiResponse<PostDto>> {
        return apiPut<PostDto>(`posts/${id}`, data);
    },

    remove(id: number): Promise<ApiResponse<boolean>> {
        return apiDelete<boolean>(`posts/${id}`);
    },

    like(id: number): Promise<ApiResponse<boolean>> {
        return apiPost<boolean>(`posts/${id}/like`);
    },

    unlike(id: number): Promise<ApiResponse<boolean>> {
        return apiDelete<boolean>(`posts/${id}/like`);
    },

    addTag(postId: number, tagId: number): Promise<ApiResponse<boolean>> {
        return apiPost<boolean>(`posts/${postId}/tags`, { tagId });
    },

    removeTag(postId: number, tagId: number): Promise<ApiResponse<boolean>> {
        return apiDelete<boolean>(`posts/${postId}/tags/${tagId}`);
    },
};