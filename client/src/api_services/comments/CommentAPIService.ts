// src/api_services/comments/CommentAPIService.ts
import type { CommentDto, CreateCommentDto, UpdateCommentDto } from '../../models/comments/CommentDTO';
import type { ApiResponse } from '../../helpers/api';
import { apiGet, apiPost, apiPut, apiDelete } from '../../helpers/api';
import type { ICommentsAPIService } from './ICommentAPIService';

export const CommentAPIService: ICommentsAPIService = {
    getCommentsByPost: async (postId: number): Promise<ApiResponse<CommentDto[]>> => {
        console.log('📡 CommentAPIService.getCommentsByPost - calling API for postId:', postId);
        const response = await apiGet<CommentDto[]>(`posts/${postId}/comments`);
        console.log('📡 CommentAPIService.getCommentsByPost - response:', response);
        console.log('📡 CommentAPIService.getCommentsByPost - response.data:', response.data);
        console.log('📡 CommentAPIService.getCommentsByPost - response.data length:', Array.isArray(response.data) ? response.data.length : 'not an array');
        return response;
    },

    createComment: (_token: string, data: CreateCommentDto): Promise<ApiResponse<CommentDto>> =>
        apiPost<CommentDto>(`posts/${data.post_id}/comments?parentId=${data.parent_id}`, data),

    updateComment: (_token: string, id: number, data: UpdateCommentDto): Promise<ApiResponse<CommentDto>> =>
        apiPut<CommentDto>(`comments/${id}`, data),

    deleteComment: (_token: string, id: number): Promise<ApiResponse<boolean>> =>
        apiDelete<boolean>(`comments/${id}`),

    likeComment: (_token: string, id: number): Promise<ApiResponse<boolean>> =>
        apiPost<boolean>(`comments/${id}/like`),

    unlikeComment: (_token: string, id: number): Promise<ApiResponse<boolean>> =>
        apiDelete<boolean>(`comments/${id}/like`),
};