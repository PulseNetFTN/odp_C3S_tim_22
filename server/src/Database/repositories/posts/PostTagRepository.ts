import { IPostTagRepository } from '../../../Domain/repositories/post_repository/IPostTagRepository';
import { BaseRepository } from '../BaseRepository';

export class PostTagRepository extends BaseRepository implements IPostTagRepository {

    async addTag(postId: number, tagId: number): Promise<boolean> {
        const result = await this.executeWrite(
            'INSERT INTO post_tags (post_id, tag_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
            [postId, tagId]
        );
        return result.ok;
    }

    async addTags(postId: number, tagIds: number[]): Promise<boolean> {
        if (!tagIds || tagIds.length === 0) return false;
        const placeholders = tagIds.map((_, i) => `($1, $${i + 2})`).join(', ');
        const result = await this.executeWrite(
            `INSERT INTO post_tags (post_id, tag_id) VALUES ${placeholders} ON CONFLICT DO NOTHING`,
            [postId, ...tagIds]
        );
        return result.ok;
    }

    async removeTag(postId: number, tagId: number): Promise<boolean> {
        const result = await this.executeWrite(
            'DELETE FROM post_tags WHERE post_id = $1 AND tag_id = $2',
            [postId, tagId]
        );
        return result.ok && result.data.affectedRows > 0;
    }

    async getTagIds(postId: number): Promise<number[]> {
        return this.executeRead(
            'SELECT tag_id FROM post_tags WHERE post_id = $1',
            [postId],
            (r) => r.tag_id as number
        );
    }

    async getTagIdsBatch(postIds: number[]): Promise<Map<number, number[]>> {
        if (!postIds || postIds.length === 0) return new Map<number, number[]>();
        const placeholders = this.buildPlaceholders(postIds);
        const result = await this.executeRead(
            `SELECT post_id, tag_id FROM post_tags WHERE post_id IN (${placeholders})`,
            postIds,
            (r) => ({ postId: r.post_id as number, tagId: r.tag_id as number })
        );
        const tagMap = new Map<number, number[]>();
        result.forEach(r => {
            if (!tagMap.has(r.postId)) tagMap.set(r.postId, []);
            tagMap.get(r.postId)?.push(r.tagId);
        });
        return tagMap;
    }
}
