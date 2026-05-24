import { CommentDto } from '../../Domain/DTOs/comments/CommentDto';
import { ErrorCode } from '../../Domain/enums/ErrorCode';
import { Comment } from '../../Domain/models/Comment';
import { ICommentLikeRepository } from '../../Domain/repositories/comments/ICommentLikeRepository';
import { ICommentQueryRepository } from '../../Domain/repositories/comments/ICommentQueryRepository';
import { ICommentReadWriteRepository } from '../../Domain/repositories/comments/ICommentReadWriteRepository';
import { ICommunityRepository } from '../../Domain/repositories/communities/ICommunityRepository';
import { ICommunityMemberRepository } from '../../Domain/repositories/communities/ICommunityMemberRepository';
import { IPostRepository } from '../../Domain/repositories/post_repository/IPostRepository';
import { ICommentService } from '../../Domain/services/comments/ICommentService';
import { ServiceResult } from '../../Domain/types/ServiceResult';
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
} from '../../Domain/types/inputs/CommentInputs';

export class CommentService implements ICommentService {
    public constructor(
        private commentReadWriteRepository: ICommentReadWriteRepository,
        private commentQueryRepository: ICommentQueryRepository,
        private commentLikeRepository: ICommentLikeRepository,
        private postRepository: IPostRepository,
        private communityMemberRepository: ICommunityMemberRepository
    ) {}

    async getAllComments(): Promise<ServiceResult<CommentDto[]>> {
        const comments = await this.commentReadWriteRepository.getByPost(0);
        const dtos = await Promise.all(comments.map(c => this.buildCommentDto(c)));
        return { success: true, data: dtos };
    }

    async addComment(input: AddCommentInput): Promise<ServiceResult<CommentDto>> {
        const post = await this.postRepository.getById(input.postId);
        if (!post) {
            return { success: false, message: 'Post not found', errorCode: ErrorCode.NOT_FOUND };
        }

        if (input.parentId !== null) {
            const parent = await this.commentReadWriteRepository.getById(input.parentId);
            if (!parent) {
                return { success: false, message: 'Parent comment not found', errorCode: ErrorCode.NOT_FOUND };
            }
            if (parent.postId !== input.postId) {
                return { success: false, message: 'Parent comment does not belong to this post', errorCode: ErrorCode.VALIDATION_ERROR };
            }
            if (parent.parentId !== null) {
                return { success: false, message: 'Maximum comment depth is 2 levels', errorCode: ErrorCode.VALIDATION_ERROR };
            }
        }

        const comment = await this.commentReadWriteRepository.create(
            new Comment(0, input.postId, input.authorId, input.parentId ?? null, 0, input.content, false, false, new Date(), new Date()));

        if (!comment) {
            return { success: false, message: 'Failed to create comment', errorCode: ErrorCode.INTERNAL_ERROR };
        }

        const dto = await this.buildCommentDto(comment);
        return { success: true, data: dto };
    }

    async getCommentsByPost(input: GetCommentsByPostInput): Promise<ServiceResult<CommentDto[]>> {
        const post = await this.postRepository.getById(input.postId);
        if (!post) {
            return { success: false, message: 'Post not found', errorCode: ErrorCode.NOT_FOUND };
        }

        const comments = await this.commentReadWriteRepository.getByPost(input.postId);
        const dtos = await Promise.all(comments.map(c => this.buildCommentDto(c)));

        const rootComments = dtos.filter(c => c.parentId === null);
        const replies = dtos.filter(c => c.parentId !== null);

        for (const root of rootComments) {
            root.replies = replies.filter(r => r.parentId === root.id);
        }

        return { success: true, data: rootComments };
    }

    async updateComment(input: UpdateCommentInput): Promise<ServiceResult<CommentDto>> {
        const comment = await this.commentReadWriteRepository.getById(input.commentId);
        if (!comment) {
            return { success: false, message: 'Comment not found', errorCode: ErrorCode.NOT_FOUND };
        }
        if (comment.authorId !== input.requesterId) {
            return { success: false, message: 'Not authorized to update this comment', errorCode: ErrorCode.FORBIDDEN };
        }
        if (comment.isDeleted) {
            return { success: false, message: 'Cannot update a deleted comment', errorCode: ErrorCode.VALIDATION_ERROR };
        }

        const result = await this.commentReadWriteRepository.update(input.commentId, input.content);
        if (!result) {
            return { success: false, message: 'Update failed', errorCode: ErrorCode.INTERNAL_ERROR };
        }

        comment.content = input.content;
        const dto = await this.buildCommentDto(comment);
        return { success: true, data: dto };
    }

    async softDeleteComment(input: DeleteCommentInput): Promise<ServiceResult<boolean>> {
        const comment = await this.commentReadWriteRepository.getById(input.commentId);
        if (!comment) {
            return { success: false, message: 'Comment not found', errorCode: ErrorCode.NOT_FOUND };
        }

        const post = await this.postRepository.getById(comment.postId);
        if (!post) {
            return { success: false, message: 'Associated post not found', errorCode: ErrorCode.NOT_FOUND };
        }

        const member = await this.communityMemberRepository.getMember(input.requesterId, post.communityId);
        const isAuthor = comment.authorId === input.requesterId;
        const isModerator = member?.role === 'moderator';

        if (!isAuthor && !isModerator) {
            return { success: false, message: 'Not authorized to delete this comment', errorCode: ErrorCode.FORBIDDEN };
        }

        const result = await this.commentReadWriteRepository.softDelete(input.commentId);
        if (!result) {
            return { success: false, message: 'Delete failed', errorCode: ErrorCode.INTERNAL_ERROR };
        }

        return { success: true, data: true };
    }

    async flagComment(input: FlagCommentInput): Promise<ServiceResult<boolean>> {
        const comment = await this.commentReadWriteRepository.getById(input.commentId);
        if (!comment) {
            return { success: false, message: 'Comment not found', errorCode: ErrorCode.NOT_FOUND };
        }

        const member = await this.communityMemberRepository.getMember(input.requesterId, input.communityId);
        if (member?.role !== 'moderator') {
            return { success: false, message: 'Only moderators can flag comments', errorCode: ErrorCode.FORBIDDEN };
        }

        const result = await this.commentReadWriteRepository.setFlag(input.commentId, true);
        if (!result) {
            return { success: false, message: 'Flag failed', errorCode: ErrorCode.INTERNAL_ERROR };
        }

        return { success: true, data: true };
    }

    async likeComment(input: LikeCommentInput): Promise<ServiceResult<boolean>> {
        const comment = await this.commentReadWriteRepository.getById(input.commentId);
        if (!comment) {
            return { success: false, message: 'Comment not found', errorCode: ErrorCode.NOT_FOUND };
        }

        const alreadyLiked = await this.commentLikeRepository.hasLiked(input.userId, input.commentId);
        if (alreadyLiked) {
            return { success: false, message: 'You have already liked this comment', errorCode: ErrorCode.ALREADY_EXISTS };
        }

        const result = await this.commentLikeRepository.like(input.commentId, input.userId);
        if (!result) {
            return { success: false, message: 'Failed to like comment', errorCode: ErrorCode.INTERNAL_ERROR };
        }

        return { success: true, data: true };
    }

    async unlikeComment(input: UnlikeCommentInput): Promise<ServiceResult<boolean>> {
        const comment = await this.commentReadWriteRepository.getById(input.commentId);
        if (!comment) {
            return { success: false, message: 'Comment not found', errorCode: ErrorCode.NOT_FOUND };
        }

        const hasLiked = await this.commentLikeRepository.hasLiked(input.userId, input.commentId);
        if (!hasLiked) {
            return { success: false, message: 'You have not liked this comment', errorCode: ErrorCode.VALIDATION_ERROR };
        }

        const result = await this.commentLikeRepository.unlike(input.commentId, input.userId);
        if (!result) {
            return { success: false, message: 'Failed to unlike comment', errorCode: ErrorCode.INTERNAL_ERROR };
        }

        return { success: true, data: true };
    }

    async findRootCommentsByPost(input: FindRootCommentsByPostInput): Promise<ServiceResult<CommentDto[]>> {
        const post = await this.postRepository.getById(input.postId);
        if (!post) {
            return { success: false, message: 'Post not found', errorCode: ErrorCode.NOT_FOUND };
        }

        const comments = await this.commentQueryRepository.findRootCommentsByPost(input.postId);
        const dtos = await Promise.all(comments.map(c => this.buildCommentDto(c)));
        return { success: true, data: dtos };
    }

    async findRepliesByCommentId(input: FindRepliesByCommentIdInput): Promise<ServiceResult<CommentDto[]>> {
        const comment = await this.commentReadWriteRepository.getById(input.commentId);
        if (!comment) {
            return { success: false, message: 'Comment not found', errorCode: ErrorCode.NOT_FOUND };
        }

        const replies = await this.commentQueryRepository.findRepliesByCommentId(input.commentId);
        const dtos = await Promise.all(replies.map(r => this.buildCommentDto(r)));
        return { success: true, data: dtos };
    }

    async findRepliesPaginated(input: FindRepliesPaginatedInput): Promise<ServiceResult<CommentDto[]>> {
        const comment = await this.commentReadWriteRepository.getById(input.commentId);
        if (!comment) {
            return { success: false, message: 'Comment not found', errorCode: ErrorCode.NOT_FOUND };
        }

        if (input.limit <= 0 || input.offset < 0) {
            return { success: false, message: 'Invalid pagination parameters', errorCode: ErrorCode.VALIDATION_ERROR };
        }

        const replies = await this.commentQueryRepository.findRepliesPaginated(input.commentId, input.limit, input.offset);
        const dtos = await Promise.all(replies.map(r => this.buildCommentDto(r)));
        return { success: true, data: dtos };
    }

    async getReplyCount(input: GetReplyCountInput): Promise<ServiceResult<number>> {
        const comment = await this.commentReadWriteRepository.getById(input.commentId);
        if (!comment) {
            return { success: false, message: 'Comment not found', errorCode: ErrorCode.NOT_FOUND };
        }

        const count = await this.commentQueryRepository.getReplyCount(input.commentId);
        return { success: true, data: count ?? 0 };
    }

    private async buildCommentDto(comment: Comment): Promise<CommentDto> {

        return new CommentDto(
            comment.id,
            comment.isDeleted ? '[comment deleted]' : comment.content,
            comment.postId,
            comment.authorId,
            comment.parentId,
            comment.isDeleted,
            comment.isFlagged,
            [],
            comment.createdAt,
            comment.updatedAt
        );
    }
}