import { BaseRepository } from '../BaseRepository';
import { ICommentLikeRepository } from '../../../Domain/repositories/comments/ICommentLikeRepository';

export class CommentLikeRepository extends BaseRepository implements ICommentLikeRepository {

    async like(commentId: number, userId: number): Promise<boolean> {
        const result = await this.executeWrite(
            'INSERT INTO comment_likes (user_id, comment_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
            [userId, commentId]
        );
        return result.ok && result.data.affectedRows > 0;
    }



    async unlike(commentId: number, userId: number): Promise<boolean> {
        const result = await this.executeWrite(
            'DELETE FROM comment_likes WHERE user_id = $1 AND comment_id = $2',
            [userId, commentId]
        );
        return result.ok && result.data.affectedRows > 0;
    }

    async getLikeCount(commentId: number): Promise<number> {
        const result = await this.executeScalar<number>(
            'SELECT COUNT(*)::int as count FROM comment_likes WHERE comment_id = $1',
            [commentId]
        );
        return result.ok ? result.data : 0;
    }

    async getLikeCountBatch(commentIds: number[]) : Promise<Map<number, number>> {
        if(!commentIds || commentIds.length === 0) return new Map<number, number>();
        const placeholders = this.buildPlaceholders(commentIds);
        const result = await this.executeRead(
            `SELECT comment_id, COUNT(*)::int as count FROM comment_likes WHERE comment_id IN (${placeholders}) GROUP BY comment_id`,
                commentIds,
                (r) => ({commentId: r.comment_id as number, count: r.count as number})
        );
        const likeCountMap = new Map<number, number>();
        result.forEach(r => likeCountMap.set(r.commentId, r.count));
        return likeCountMap;
    }    

    async getLikedCommentIds(userId: number, commentIds: number[]): Promise<Set<number>> {
        if (!commentIds || commentIds.length === 0) return new Set<number>();
        const placeholders = this.buildPlaceholders(commentIds, 1);
        const result = await this.executeRead(
            `SELECT comment_id FROM comment_likes WHERE user_id = $1 AND comment_id IN (${placeholders})`,
            [userId, ...commentIds],
            (r) => r.comment_id as number
        );
        return new Set(result);
    }

    async hasLiked(userId: number, commentId: number): Promise<boolean> {
        const result = await this.executeScalar<number>(
            'SELECT COUNT(*)::int as count FROM comment_likes WHERE user_id = $1 AND comment_id = $2',
            [userId, commentId]
        );
        return result.ok && result.data > 0;
    }
}
