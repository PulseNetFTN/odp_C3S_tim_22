import { apiGet, apiPost, apiPut, apiDelete } from '../../helpers/api';
import type { ApiResponse } from '../../helpers/api';
import type { AdminUserDto } from '../../models/users/UserDto';
import type { CommunityDto } from '../../models/communities/CommunityDto';
import type { PostDto } from '../../models/posts/PostsDto';
import type { TagDto } from '../../models/tags/TagsDto';
import type { CommentDto } from '../../models/comments/CommentDTO';
import type { PaginatedResponse, AuditLog, HealthStatus, IAdminAPIService } from './IAdminAPIService';

export const AdminAPIService: IAdminAPIService = {
    getAllUsers: (_token: string, page: number = 1, limit: number = 20): Promise<ApiResponse<PaginatedResponse<AdminUserDto>>> =>
        apiGet<PaginatedResponse<AdminUserDto>>(`users/all?page=${page}&limit=${limit}`),

    updateUserRole: (_token: string, userId: number, role: string): Promise<ApiResponse<boolean>> =>
        apiPut<boolean>(`users/${userId}/role`, { role }),

    getAllCommunities: (_token: string, page: number = 1, limit: number = 20): Promise<ApiResponse<PaginatedResponse<CommunityDto>>> =>
        apiGet<PaginatedResponse<CommunityDto>>(`communities/all?page=${page}&limit=${limit}`),

    deleteCommunity: (_token: string, communityId: number): Promise<ApiResponse<boolean>> =>
        apiDelete<boolean>(`communities/${communityId}`),

    deletePost: (_token: string, postId: number): Promise<ApiResponse<boolean>> =>
        apiDelete<boolean>(`posts/${postId}`),

    getAllPosts: (_token: string, page: number = 1, limit: number = 20): Promise<ApiResponse<PaginatedResponse<PostDto>>> =>
        apiGet<PaginatedResponse<PostDto>>(`posts/public?page=${page}&limit=${limit}`),

    getAllComments: (_token: string, page: number = 1, limit: number = 20): Promise<ApiResponse<PaginatedResponse<CommentDto>>> =>
        apiGet<PaginatedResponse<CommentDto>>(`comments/all?page=${page}&limit=${limit}`),

    getAuditLogs: (_token: string, page: number = 1, limit: number = 50): Promise<ApiResponse<PaginatedResponse<AuditLog>>> =>
        apiGet<PaginatedResponse<AuditLog>>(`audits/logs?page=${page}&limit=${limit}`),

    getHealth: (): Promise<ApiResponse<{ status: string; uptime: number; timestamp: string }>> =>
        apiGet<{ status: string; uptime: number; timestamp: string }>(`health`),

    getHealthDB: (): Promise<ApiResponse<HealthStatus>> =>
        apiGet<HealthStatus>(`health/db`),

    triggerFailover: (_token: string, slaveId: number): Promise<ApiResponse<{ success: boolean; message: string }>> =>
        apiPost<{ success: boolean; message: string }>(`health/failover`, { slaveId }),

    getAllTags: (): Promise<ApiResponse<TagDto[]>> =>
        apiGet<TagDto[]>(`tags`),

    createTag: (_token: string, name: string): Promise<ApiResponse<TagDto>> =>
        apiPost<TagDto>(`tags`, { name }),

    deleteTag: (_token: string, id: number): Promise<ApiResponse<boolean>> =>
        apiDelete<boolean>(`tags/${id}`),
};
