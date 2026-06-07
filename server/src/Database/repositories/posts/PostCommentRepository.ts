import { IPostCommentRepository } from '../../../Domain/repositories/post_repository/IPostCommentRepository';
import { BaseRepository } from '../BaseRepository';

export class PostCommentRepository extends BaseRepository implements IPostCommentRepository {

    async getCommentCount(postId: number): Promise<number> {
        const result = await this.executeScalar<number>(
            'SELECT COUNT(*)::int as count FROM comments WHERE post_id = $1 AND is_deleted = FALSE',
            [postId]
        );
        return result.ok ? result.data : 0;
    }

    async getCommentCountBatch(postIds: number[]): Promise<Map<number, number>> {
        if (!postIds || postIds.length === 0) return new Map();
        const placeholders = this.buildPlaceholders(postIds);
        const rows = await this.executeRead(
            `SELECT post_id, COUNT(*)::int as count FROM comments WHERE post_id IN (${placeholders}) AND is_deleted = FALSE GROUP BY post_id`,
            postIds,
            (r) => ({ postId: r.post_id as number, count: r.count as number })
        );
        const map = new Map<number, number>();
        rows.forEach(r => map.set(r.postId, r.count));
        return map;
    }
}
