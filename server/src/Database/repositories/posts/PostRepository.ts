import { BaseRepository } from '../BaseRepository';
import { IPostRepository } from '../../../Domain/repositories/post_repository/IPostRepository';
import { Post } from '../../../Domain/models/Post';
import { mapPost, SELECT_FIELDS } from '../../mappers/PostMapper';
import { RepositoryResult } from '../../../Domain/types/RepositoryResult';

export class PostRepository extends BaseRepository implements IPostRepository {

    async create(post: Post): Promise<RepositoryResult<Post>> {
        const result = await this.executeWrite(
            'INSERT INTO posts (title, content, media_url, community_id, author_id) VALUES ($1, $2, $3, $4, $5) RETURNING id',
            [post.title, post.content, post.mediaUrl, post.communityId, post.authorId]
        );
        if (!result.ok) return RepositoryResult.failure(result.message);
        if (!result.data.insertId) return RepositoryResult.failure('Insert returned no ID');
        return RepositoryResult.success(
            new Post(result.data.insertId, post.title, post.content, post.mediaUrl, post.communityId, post.authorId)
        );
    }

    async getById(id: number): Promise<RepositoryResult<Post>> {
        return this.executeReadOne(`SELECT ${SELECT_FIELDS} FROM posts WHERE id = $1`, [id], mapPost);
    }

    async getByIds(ids: number[]): Promise<Post[]> {
        if (ids.length === 0) return [];
        const placeholders = this.buildPlaceholders(ids);
        return this.executeRead(
            `SELECT ${SELECT_FIELDS} FROM posts WHERE id IN (${placeholders})`,
            ids,
            mapPost
        );
    }

    async getByCommunityId(communityId: number): Promise<Post[]> {
        return this.executeRead(
            `SELECT ${SELECT_FIELDS} FROM posts WHERE community_id = $1 ORDER BY created_at DESC`,
            [communityId],
            mapPost
        );
    }

    async getByAuthorId(authorId: number): Promise<Post[]> {
        return this.executeRead(
            `SELECT ${SELECT_FIELDS} FROM posts WHERE author_id = $1 ORDER BY created_at DESC`,
            [authorId],
            mapPost
        );
    }

    async getPostCountByAuthor(authorId: number): Promise<number> {
        const result = await this.executeScalar<number>(
            'SELECT COUNT(*)::int as count FROM posts WHERE author_id = $1',
            [authorId]
        );
        return result.ok ? result.data : 0;
    }

    async getCommunityPostIds(communityIds: number[]): Promise<number[]> {
        if (communityIds.length === 0) return [];
        const placeholders = this.buildPlaceholders(communityIds);
        return this.executeRead(
            `SELECT id FROM posts WHERE community_id IN (${placeholders})`,
            communityIds,
            (r) => r.id as number
        );
    }

    async getFollowedAuthorPostIds(authorIds: number[]): Promise<number[]> {
        if (authorIds.length === 0) return [];
        const placeholders = this.buildPlaceholders(authorIds);
        return this.executeRead(
            `SELECT id FROM posts WHERE author_id IN (${placeholders})`,
            authorIds,
            (r) => r.id as number
        );
    }

    async getPublicPosts(limit: number): Promise<Post[]> {
        return this.executeRead(
            `SELECT ${SELECT_FIELDS} FROM posts WHERE community_id IN (SELECT id FROM communities WHERE type = 'public') ORDER BY created_at DESC LIMIT $1`,
            [limit],
            mapPost
        );
    }

    async update(post: Post): Promise<RepositoryResult<Post>> {
        const result = await this.executeWrite(
            'UPDATE posts SET title = $1, content = $2, media_url = $3 WHERE id = $4',
            [post.title, post.content, post.mediaUrl, post.id]
        );
        if (!result.ok) return RepositoryResult.failure(result.message);
        if (result.data.affectedRows === 0) return RepositoryResult.notFound('Post not found for update');
        return RepositoryResult.success(post);
    }

    async delete(id: number): Promise<boolean> {
        const result = await this.executeWrite('DELETE FROM posts WHERE id = $1', [id]);
        return result.ok && result.data.affectedRows > 0;
    }
}
