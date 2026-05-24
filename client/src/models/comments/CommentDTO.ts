export interface CommentAuthor {
    id: number;
    username: string;
    avatar?: string;
}

// Matches actual API response (camelCase from backend)
export interface CommentDto {
    id: number;
    postId: number;
    authorId: number;
    parentId: number | null;
    content: string;
    isDeleted: number;
    isFlagged: number;
    createdAt: string;
    updatedAt?: string;
    likesCount: number;
    isLiked: boolean;
    username?: string;
    replies?: CommentDto[];

    /** @deprecated use postId */
    post_id?: number;
    /** @deprecated use authorId */
    author_id?: number;
    /** @deprecated use parentId */
    parent_id?: number | null;
    /** @deprecated use createdAt */
    created_at?: string;
    /** @deprecated use updatedAt */
    updated_at?: string;
    /** @deprecated use isLiked */
    is_liked?: boolean;
    /** @deprecated use likesCount */
    likes_count?: number;
    /** @deprecated check isDeleted */
    deleted_at?: string | null;
    author?: CommentAuthor;
}

export interface CreateCommentDto {
    post_id: number;
    content: string;
    parent_id?: number | null;
}

export interface UpdateCommentDto {
    content: string;
}

export type CommentSortOption = 'newest' | 'most_liked';
