export interface ICommentLikeRepository {
    like(commentId: number, userId: number): Promise<boolean>;
    unlike(commentId: number, userId: number): Promise<boolean>;
    getLikeCount(commentId: number): Promise<number>;
    getLikeCountBatch(commentIds: number[]): Promise<Map<number, number>>;
    getLikedCommentIds(userId: number, commentIds: number[]): Promise<Set<number>>;
    hasLiked(userId: number, commentId: number): Promise<boolean>;
}
