import type { CommentDto, CreateCommentDto, UpdateCommentDto } from '../../models/comments/CommentDTO';
import type { ApiResponse } from '../../types/api/ApiResponse';

export interface ICommentsAPIService {
    getCommentsByPost(postId: number): Promise<ApiResponse<CommentDto[]>>;
    createComment(token: string, data: CreateCommentDto): Promise<ApiResponse<CommentDto>>;
    updateComment(token: string, id: number, data: UpdateCommentDto): Promise<ApiResponse<CommentDto>>;
    deleteComment(token: string, id: number): Promise<ApiResponse<boolean>>;
    likeComment(token: string, id: number): Promise<ApiResponse<boolean>>;
    unlikeComment(token: string, id: number): Promise<ApiResponse<boolean>>;
}