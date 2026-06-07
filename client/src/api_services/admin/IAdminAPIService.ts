import type { AdminUserDto } from '../../models/users/UserDto';
import type { CommunityDto } from '../../models/communities/CommunityDto';
import type { PostDto } from '../../models/posts/PostsDto';
import type { TagDto } from '../../models/tags/TagsDto';
import type { CommentDto } from '../../models/comments/CommentDTO';
import type { ApiResponse } from '../../types/api/ApiResponse';

export interface PaginatedResponse<T> {
    data: T[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}



export interface DashboardStats {
    totalUsers: number;
    totalCommunities: number;
    totalPosts: number;
    totalComments: number;
    activeUsersToday: number;
    newUsersThisWeek: number;
}

export interface AuditLogChanges {
    [key: string]: {
        from: string | number | boolean | null;
        to: string | number | boolean | null;
    } | string | number | boolean | null;
}

export interface AuditLog {
    id: number;
    entityType: string;
    entityId: number;
    action: string;
    userId: number;
    username: string;
    oldData: Record<string, string | number | boolean | null> | null;
    newData: Record<string, string | number | boolean | null> | null;
    changes: AuditLogChanges | null;
    ipAddress: string;
    createdAt: string;
}

export interface NodeStatus {
    name: string;
    status: 'healthy' | 'degraded' | 'unreachable';
    responseTime: number;
    lastChecked: Date | null;
}

export interface HealthStatus {
    nodes: NodeStatus[];
    connections: {
        read: string;
        write: string;
    };
}

export interface IAdminAPIService {
    getAllUsers(token: string, page?: number, limit?: number): Promise<ApiResponse<PaginatedResponse<AdminUserDto>>>;
    updateUserRole(token: string, userId: number, role: string): Promise<ApiResponse<boolean>>;

    getAllCommunities(token: string, page?: number, limit?: number): Promise<ApiResponse<PaginatedResponse<CommunityDto>>>;
    deleteCommunity(token: string, communityId: number): Promise<ApiResponse<boolean>>;

    getAllPosts(token: string, page?: number, limit?: number): Promise<ApiResponse<PaginatedResponse<PostDto>>>;
    deletePost(token: string, postId: number): Promise<ApiResponse<boolean>>;

    getAllComments(token: string, page?: number, limit?: number): Promise<ApiResponse<PaginatedResponse<CommentDto>>>;

    getAuditLogs(token: string, page?: number, limit?: number): Promise<ApiResponse<PaginatedResponse<AuditLog>>>;

    getHealth(): Promise<ApiResponse<{ status: string; uptime: number; timestamp: string }>>;
    getHealthDB(): Promise<ApiResponse<HealthStatus>>;
    triggerFailover(token: string, slaveId: number): Promise<ApiResponse<{ success: boolean; message: string }>>;

    getAllTags(): Promise<ApiResponse<TagDto[]>>;
    updateTag(token: string, id: number, name: string): Promise<ApiResponse<TagDto>>;
    createTag(token: string, name: string): Promise<ApiResponse<TagDto>>;
    deleteTag(token: string, id: number): Promise<ApiResponse<boolean>>;
}