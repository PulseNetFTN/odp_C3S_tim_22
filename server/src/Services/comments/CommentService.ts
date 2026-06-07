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
    GetCommentsByUserInput,
} from '../../Domain/types/inputs/CommentInputs';
import { IUserRepository } from '../../Domain/repositories/users/IUserRepository';
import { UserRole } from '../../Domain/enums/UserRole';
import { CommunityRole } from '../../Domain/enums/CommunityRole';

export class CommentService implements ICommentService {
    public constructor(
        private commentReadWriteRepository: ICommentReadWriteRepository,
        private commentQueryRepository: ICommentQueryRepository,
        private commentLikeRepository: ICommentLikeRepository,
        private postRepository: IPostRepository,
        private communityMemberRepository: ICommunityMemberRepository,
        private userRepository: IUserRepository
    ) {}

    async addComment(input: AddCommentInput): Promise<ServiceResult<CommentDto>> {
        const postResult = await this.postRepository.getById(input.postId);
        if (!postResult.ok) {
            return { success: false, message: 'Post not found', errorCode: ErrorCode.NOT_FOUND };
        }

        if (input.parentId !== null) {
            const parentResult = await this.commentReadWriteRepository.getById(input.parentId);
            if (!parentResult.ok) {
                return { success: false, message: 'Parent comment not found', errorCode: ErrorCode.NOT_FOUND };
            }
            const parent = parentResult.data;
            if (parent.postId !== input.postId) {
                return { success: false, message: 'Parent comment does not belong to this post', errorCode: ErrorCode.VALIDATION_ERROR };
            }
            if (parent.parentId !== null) {
                return { success: false, message: 'Maximum comment depth is 2 levels', errorCode: ErrorCode.VALIDATION_ERROR };
            }
        }

        const commentResult = await this.commentReadWriteRepository.create(
            new Comment(0, input.postId, input.authorId, input.parentId, 0, input.content, false, false, new Date(), new Date()));

        if (!commentResult.ok) {
            return { success: false, message: 'Failed to create comment', errorCode: ErrorCode.INTERNAL_ERROR };
        }

        const dto = await this.buildCommentDto(commentResult.data);
        return { success: true, data: dto };
    }

    async getCommentsByPost(input: GetCommentsByPostInput): Promise<ServiceResult<CommentDto[]>> {
        const postResult = await this.postRepository.getById(input.postId);
        if (!postResult.ok) {
            return { success: false, message: 'Post not found', errorCode: ErrorCode.NOT_FOUND };
        }

        const comments = await this.commentReadWriteRepository.getByPost(input.postId);
        const dtos = await this.buildCommentDtos(comments, input.currentUserId ?? undefined);

        const rootComments = dtos.filter(c => c.parentId === null);
        const replies = dtos.filter(c => c.parentId !== null);
        for (const root of rootComments) {
            root.replies = replies.filter(r => r.parentId === root.id);
        }

        return { success: true, data: rootComments };
    }

    async getCommentsByUser(input: GetCommentsByUserInput): Promise<ServiceResult<CommentDto[]>> {
        const comments = await this.commentReadWriteRepository.getByAuthor(input.userId);
        const visibleComments = comments.filter(c => !c.isDeleted);
        const dtos = await this.buildCommentDtos(visibleComments, input.requesterId ?? undefined);
        return { success: true, data: dtos };
    }

    async updateComment(input: UpdateCommentInput): Promise<ServiceResult<CommentDto>> {
        const commentResult = await this.commentReadWriteRepository.getById(input.commentId);
        if (!commentResult.ok) {
            return { success: false, message: 'Comment not found', errorCode: ErrorCode.NOT_FOUND };
        }
        const comment = commentResult.data;

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
        const commentResult = await this.commentReadWriteRepository.getById(input.commentId);
        if (!commentResult.ok) {
            return { success: false, message: 'Comment not found', errorCode: ErrorCode.NOT_FOUND };
        }
        const comment = commentResult.data;

        const isAdmin = input.requesterRole === UserRole.Admin;
        const isAuthor = comment.authorId === input.requesterId;

        if (!isAdmin && !isAuthor) {
            const postResult = await this.postRepository.getById(comment.postId);
            if (!postResult.ok) {
                return { success: false, message: 'Associated post not found', errorCode: ErrorCode.NOT_FOUND };
            }
            const memberResult = await this.communityMemberRepository.getMember(input.requesterId, postResult.data.communityId);
            const isModerator = memberResult.ok && memberResult.data.role === CommunityRole.Moderator;
            if (!isModerator) {
                return { success: false, message: 'Not authorized to delete this comment', errorCode: ErrorCode.FORBIDDEN };
            }
        }

        const result = await this.commentReadWriteRepository.softDelete(input.commentId);
        if (!result) {
            return { success: false, message: 'Delete failed', errorCode: ErrorCode.INTERNAL_ERROR };
        }

        return { success: true, data: true };
    }

    async flagComment(input: FlagCommentInput): Promise<ServiceResult<boolean>> {
        const commentResult = await this.commentReadWriteRepository.getById(input.commentId);
        if (!commentResult.ok) {
            return { success: false, message: 'Comment not found', errorCode: ErrorCode.NOT_FOUND };
        }

        const postResult = await this.postRepository.getById(commentResult.data.postId);
        if (!postResult.ok) {
            return { success: false, message: 'Associated post not found', errorCode: ErrorCode.NOT_FOUND };
        }

        const isAdmin = input.requesterRole === UserRole.Admin;
        if (!isAdmin) {
            const memberResult = await this.communityMemberRepository.getMember(input.requesterId, postResult.data.communityId);
            if (!memberResult.ok || memberResult.data.role !== CommunityRole.Moderator) {
                return { success: false, message: 'Only moderators can flag comments', errorCode: ErrorCode.FORBIDDEN };
            }
        }

        const result = await this.commentReadWriteRepository.setFlag(input.commentId, true);
        if (!result) {
            return { success: false, message: 'Flag failed', errorCode: ErrorCode.INTERNAL_ERROR };
        }

        return { success: true, data: true };
    }

    async likeComment(input: LikeCommentInput): Promise<ServiceResult<boolean>> {
        const commentResult = await this.commentReadWriteRepository.getById(input.commentId);
        if (!commentResult.ok) {
            return { success: false, message: 'Comment not found', errorCode: ErrorCode.NOT_FOUND };
        }

        const alreadyLiked = await this.commentLikeRepository.hasLiked(input.userId, input.commentId);
        if (alreadyLiked) {
            return { success: false, message: 'You have already liked this comment', errorCode: ErrorCode.ALREADY_EXISTS };
        }

        if (commentResult.data.authorId === input.userId) {         
            return { success: false, message: 'You cannot like your own comment', errorCode: ErrorCode.VALIDATION_ERROR };
        }

        const result = await this.commentLikeRepository.like(input.commentId, input.userId);
        if (!result) {
            return { success: false, message: 'Failed to like comment', errorCode: ErrorCode.INTERNAL_ERROR };
        }

        return { success: true, data: true };
    }

    async unlikeComment(input: UnlikeCommentInput): Promise<ServiceResult<boolean>> {
        const commentResult = await this.commentReadWriteRepository.getById(input.commentId);
        if (!commentResult.ok) {
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
        const postResult = await this.postRepository.getById(input.postId);
        if (!postResult.ok) {
            return { success: false, message: 'Post not found', errorCode: ErrorCode.NOT_FOUND };
        }

        const comments = await this.commentQueryRepository.findRootCommentsByPost(input.postId);
        const dtos = await this.buildCommentDtos(comments, input.currentUserId);
        return { success: true, data: dtos };
    }

    async findRepliesByCommentId(input: FindRepliesByCommentIdInput): Promise<ServiceResult<CommentDto[]>> {
        const commentResult = await this.commentReadWriteRepository.getById(input.commentId);
        if (!commentResult.ok) {
            return { success: false, message: 'Comment not found', errorCode: ErrorCode.NOT_FOUND };
        }

        const replies = await this.commentQueryRepository.findRepliesByCommentId(input.commentId);
        const dtos = await this.buildCommentDtos(replies, input.currentUserId ?? undefined);
        return { success: true, data: dtos };
    }

    async findRepliesPaginated(input: FindRepliesPaginatedInput): Promise<ServiceResult<CommentDto[]>> {
        const commentResult = await this.commentReadWriteRepository.getById(input.commentId);
        if (!commentResult.ok) {
            return { success: false, message: 'Comment not found', errorCode: ErrorCode.NOT_FOUND };
        }

        if (input.limit <= 0 || input.offset < 0) {
            return { success: false, message: 'Invalid pagination parameters', errorCode: ErrorCode.VALIDATION_ERROR };
        }

        const replies = await this.commentQueryRepository.findRepliesPaginated(input.commentId, input.limit, input.offset);
        const dtos = await this.buildCommentDtos(replies, input.currentUserId ?? undefined);
        return { success: true, data: dtos };
    }

    async getReplyCount(input: GetReplyCountInput): Promise<ServiceResult<number>> {
        const commentResult = await this.commentReadWriteRepository.getById(input.commentId);
        if (!commentResult.ok) {
            return { success: false, message: 'Comment not found', errorCode: ErrorCode.NOT_FOUND };
        }

        const count = await this.commentQueryRepository.getReplyCount(input.commentId);
        return { success: true, data: count };
    }

    private async buildCommentDtos(comments: Comment[], currentUserId?: number | null): Promise<CommentDto[]> {
        if (comments.length === 0) return [];
        const commentIds = comments.map(c => c.id);
        const authorIds = [...new Set(comments.map(c => c.authorId))];

        const [users, likeCountMap, likedSet] = await Promise.all([
            this.userRepository.getByIds(authorIds),
            this.commentLikeRepository.getLikeCountBatch(commentIds),
            currentUserId
                ? this.commentLikeRepository.getLikedCommentIds(currentUserId, commentIds)
                : Promise.resolve(new Set<number>()),
        ]);

        const usernameMap = new Map(users.map(u => [u.id, u.username]));

        return comments.map(c => new CommentDto(
            c.id,
            c.isDeleted ? '[comment deleted]' : c.content,
            c.postId,
            c.authorId,
            c.parentId,
            c.isDeleted,
            c.isFlagged,
            [],
            c.createdAt,
            c.updatedAt,
            usernameMap.get(c.authorId),
            likeCountMap.get(c.id) ?? 0,
            likedSet.has(c.id)
        ));
    }

    private async buildCommentDto(comment: Comment, currentUserId?: number): Promise<CommentDto> {
        const [userResult, likesCount] = await Promise.all([
            this.userRepository.getById(comment.authorId),
            this.commentLikeRepository.getLikeCount(comment.id),
        ]);

        const username = userResult.ok ? userResult.data.username : undefined;

        let isLiked = false;
        if (currentUserId) {
            isLiked = await this.commentLikeRepository.hasLiked(currentUserId, comment.id);
        }

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
            comment.updatedAt,
            username,
            likesCount,
            isLiked
        );
    }
}