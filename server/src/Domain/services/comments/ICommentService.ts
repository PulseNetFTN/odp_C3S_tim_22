import { CommentDto } from '../../DTOs/comments/CommentDto';
import { ServiceResult } from '../../types/ServiceResult';
import {
    AddCommentInput,
    UpdateCommentInput,
    DeleteCommentInput,
    GetCommentsByPostInput,
    FlagCommentInput,
    LikeCommentInput,
    UnlikeCommentInput,
    FindRootCommentsByPostInput,
    FindRepliesByCommentIdInput,
    FindRepliesPaginatedInput,
    GetReplyCountInput,
} from '../../types/inputs/CommentInputs';

export interface ICommentService {
    getCommentsByPost(input: GetCommentsByPostInput): Promise<ServiceResult<CommentDto[]>>;
    getAllComments(): Promise<ServiceResult<CommentDto[]>>;
    addComment(input: AddCommentInput): Promise<ServiceResult<CommentDto>>;
    updateComment(input: UpdateCommentInput): Promise<ServiceResult<CommentDto>>;
    softDeleteComment(input: DeleteCommentInput): Promise<ServiceResult<boolean>>;
    flagComment(input: FlagCommentInput): Promise<ServiceResult<boolean>>;
    likeComment(input: LikeCommentInput): Promise<ServiceResult<boolean>>;
    unlikeComment(input: UnlikeCommentInput): Promise<ServiceResult<boolean>>;
    findRootCommentsByPost(input: FindRootCommentsByPostInput): Promise<ServiceResult<CommentDto[]>>;
    findRepliesByCommentId(input: FindRepliesByCommentIdInput): Promise<ServiceResult<CommentDto[]>>;
    findRepliesPaginated(input: FindRepliesPaginatedInput): Promise<ServiceResult<CommentDto[]>>;
    getReplyCount(input: GetReplyCountInput): Promise<ServiceResult<number>>;
}