export type AddCommentInput = {
    authorId: number;
    postId: number;
    content: string;
    parentId: number | null;
};

export type UpdateCommentInput = {
    commentId: number;
    requesterId: number;
    content: string;
};

import { UserRole } from '../../enums/UserRole';

export type DeleteCommentInput = {
    commentId: number;
    requesterId: number;
    requesterRole: UserRole;
};

export type GetCommentsByPostInput = {
    postId: number;
    currentUserId: number | null;
};

export type FlagCommentInput = {
    commentId: number;
    requesterId: number;
    requesterRole: UserRole;
};

export type LikeCommentInput = {
    userId: number;
    commentId: number;
};

export type UnlikeCommentInput = {
    userId: number;
    commentId: number;
};

export type FindRootCommentsByPostInput = {
    postId: number;
    currentUserId: number | null;
};

export type FindRepliesByCommentIdInput = {
    commentId: number;
    currentUserId: number | null;
};

export type FindRepliesPaginatedInput = {
    commentId: number;
    limit: number;
    offset: number;
    currentUserId: number | null;
};

export type GetReplyCountInput = {
    commentId: number;
};

export interface GetCommentsByUserInput {
    userId: number;
    requesterId?: number | null;
}