import type { ApiResponse } from '../../helpers/api';
import type { PostDto } from '../../models/posts/PostsDto';

export interface IPostApiService {
    getPublicPosts(limit?: number): Promise<ApiResponse<PostDto[]>>;
    getFeed(): Promise<ApiResponse<PostDto[]>>;
    getPostsByUser(userId: number): Promise<ApiResponse<PostDto[]>>;
    getCommunityPosts(communityId: number, sort?: string): Promise<ApiResponse<PostDto[]>>;
    getById(id: number): Promise<ApiResponse<PostDto>>;
    create(data: { title: string; content: string; mediaUrl?: string; communityId: number; tagIds?: number[] }): Promise<ApiResponse<PostDto>>;
    update(id: number, data: { title: string; content: string; mediaUrl?: string }): Promise<ApiResponse<PostDto>>;
    remove(id: number): Promise<ApiResponse<boolean>>;
    like(id: number): Promise<ApiResponse<boolean>>;
    unlike(id: number): Promise<ApiResponse<boolean>>;
    addTag(postId: number, tagId: number): Promise<ApiResponse<boolean>>;
    removeTag(postId: number, tagId: number): Promise<ApiResponse<boolean>>;
}