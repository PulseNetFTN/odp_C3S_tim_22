import { IPostLikeRepository } from '../../../Domain/repositories/post_repository/IPostLikeRepository';
import { BaseRepository } from '../BaseRepository';

export class PostLikeRepository extends BaseRepository implements IPostLikeRepository {

    async addLike(userId: number, postId: number): Promise<boolean> {
        const result = await this.executeWrite(
            'INSERT INTO post_likes (user_id, post_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
            [userId, postId]
        );
        return result.ok;
    }

    async removeLike(userId: number, postId: number): Promise<boolean> {
        const result = await this.executeWrite(
            'DELETE FROM post_likes WHERE user_id = $1 AND post_id = $2',
            [userId, postId]
        );
        return result.ok && result.data.affectedRows > 0;
    }

    async hasLiked(userId: number, postId: number): Promise<boolean> {
        const result = await this.executeScalar<number>(
            'SELECT COUNT(*)::int as count FROM post_likes WHERE user_id = $1 AND post_id = $2',
            [userId, postId]
        );
        return result.ok && result.data > 0;
    }

    async getLikeCount(postId: number): Promise<number> {
        const result = await this.executeScalar<number>(
            'SELECT COUNT(*)::int as count FROM post_likes WHERE post_id = $1',
            [postId]
        );
        return result.ok ? result.data : 0;
    }

    async getLikeCountBatch(postIds: number[]): Promise<Map<number, number>> {
        if (!postIds || postIds.length === 0) return new Map<number, number>();
        const placeholders = this.buildPlaceholders(postIds);
        const result = await this.executeRead(
            `SELECT post_id, COUNT(*)::int as count FROM post_likes WHERE post_id IN (${placeholders}) GROUP BY post_id`,
            postIds,
            (r) => ({ postId: r.post_id as number, count: r.count as number })
        );
        const likeCountMap = new Map<number, number>();
        result.forEach(r => likeCountMap.set(r.postId, r.count));
        return likeCountMap;
    }

    async getLikedPostIds(userId: number, postIds: number[]): Promise<Set<number>> {
        if (!postIds || postIds.length === 0) return new Set();
        const placeholders = this.buildPlaceholders(postIds, 1);
        const rows = await this.executeRead(
            `SELECT post_id FROM post_likes WHERE user_id = $1 AND post_id IN (${placeholders})`,
            [userId, ...postIds],
            (r) => r.post_id as number
        );
        return new Set(rows);
    }
}
