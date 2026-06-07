import { Comment } from '../../../Domain/models/Comment';
import { BaseRepository } from '../BaseRepository';
import { mapComment, COMMENT_FIELDS } from '../../mappers/CommentMapper';
import { ICommentReadWriteRepository } from '../../../Domain/repositories/comments/ICommentReadWriteRepository';
import { RepositoryResult } from '../../../Domain/types/RepositoryResult';

export class CommentReadWriteRepository extends BaseRepository implements ICommentReadWriteRepository {

    async getById(id: number): Promise<RepositoryResult<Comment>> {
        return this.executeReadOne(
            `SELECT ${COMMENT_FIELDS} FROM comments WHERE id = $1`,
            [id],
            mapComment
        );
    }

    async getByPost(postId: number): Promise<Comment[]> {
        return this.executeRead(
            `SELECT ${COMMENT_FIELDS} FROM comments WHERE post_id = $1 ORDER BY id ASC`,
            [postId],
            mapComment
        );
    }

    async getByAuthor(authorId: number): Promise<Comment[]> {
        return this.executeRead(
            `SELECT ${COMMENT_FIELDS} FROM comments WHERE author_id = $1 ORDER BY created_at DESC`,
            [authorId],
            mapComment
        );
    }

    async getCommentCountByAuthor(authorId: number): Promise<number> {
        const result = await this.executeScalar<number>(
            'SELECT COUNT(*)::int as count FROM comments WHERE author_id = $1 AND is_deleted = FALSE',
            [authorId]
        );
        return result.ok ? result.data : 0;
    }

    async create(comment: Comment): Promise<RepositoryResult<Comment>> {
        const result = await this.executeWrite(
            'INSERT INTO comments (post_id, author_id, parent_id, content) VALUES ($1, $2, $3, $4) RETURNING id',
            [comment.postId, comment.authorId, comment.parentId, comment.content]
        );
        if (!result.ok) return RepositoryResult.failure(result.message);
        if (!result.data.insertId) return RepositoryResult.failure('Insert returned no ID');
        return this.getById(result.data.insertId);
    }

    async update(id: number, content: string): Promise<boolean> {
        const result = await this.executeWrite(
            'UPDATE comments SET content = $1 WHERE id = $2',
            [content, id]
        );
        return result.ok && result.data.affectedRows > 0;
    }

    async softDelete(id: number): Promise<boolean> {
        const result = await this.executeWrite(
            'UPDATE comments SET is_deleted = TRUE WHERE id = $1',
            [id]
        );
        return result.ok && result.data.affectedRows > 0;
    }

    async setFlag(id: number, isFlagged: boolean): Promise<boolean> {
        const result = await this.executeWrite(
            'UPDATE comments SET is_flagged = $1 WHERE id = $2',
            [isFlagged, id]
        );
        return result.ok && result.data.affectedRows > 0;
    }
}
