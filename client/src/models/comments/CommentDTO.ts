export interface CommentDto {
    id: number;
    postId: number;
    authorId: number;
    parentId: number | null;
    content: string;
    isDeleted: boolean;
    isFlagged: boolean;
    createdAt: string;
    updatedAt?: string;
    likesCount: number;
    authorUsername: string;
    isLiked: boolean;
    replies?: CommentDto[];
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
