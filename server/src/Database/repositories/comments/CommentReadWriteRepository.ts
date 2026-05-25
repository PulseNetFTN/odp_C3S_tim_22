import { Comment } from '../../../Domain/models/Comment';
import { BaseRepository } from '../BaseRepository';
import { mapComment, COMMENT_FIELDS } from '../../mappers/CommentMapper';
import { ICommentReadWriteRepository } from '../../../Domain/repositories/comments/ICommentReadWriteRepository';

export class CommentReadWriteRepository extends BaseRepository implements ICommentReadWriteRepository {

    async getById(id: number): Promise<Comment | null> {
        return this.executeReadOne(
            `SELECT ${COMMENT_FIELDS} FROM comments WHERE id = ?`,
            [id],
            mapComment
        );
    }

    async getByPost(postId: number): Promise<Comment[]> {
        return this.executeRead(
            `SELECT ${COMMENT_FIELDS}
             FROM comments WHERE post_id = ? 
             ORDER BY id ASC`,
            [postId],
            mapComment
        );
    }

    async getByAuthor(authorId: number): Promise<Comment[]> {
        return this.executeRead(
            `SELECT ${COMMENT_FIELDS} 
             FROM comments WHERE author_id = ? 
             ORDER BY created_at DESC`,
            [authorId],
            mapComment
        );
    }

    async create(comment: Comment): Promise<Comment | null> {
        const result = await this.executeWrite(
            'INSERT INTO comments (post_id, author_id, parent_id, content) VALUES (?, ?, ?, ?)',
            [comment.postId, comment.authorId, comment.parentId, comment.content]
        );
        
        if (!result?.insertId) return null;
        
        return this.getById(result.insertId);
    }

    async update(id: number, content: string): Promise<boolean> {
        const result = await this.executeWrite(
            'UPDATE comments SET content = ? WHERE id = ?',
            [content, id]
        );
        return (result?.affectedRows ?? 0) > 0;
    }

    async softDelete(id: number): Promise<boolean> {
        const result = await this.executeWrite(
            'UPDATE comments SET is_deleted = ? WHERE id = ?',
            [1, id]
        );
        return (result?.affectedRows ?? 0) > 0;
    }

    async setFlag(id: number, isFlagged: boolean): Promise<boolean> {
        const result = await this.executeWrite(
            'UPDATE comments SET is_flagged = ? WHERE id = ?',
            [isFlagged ? 1 : 0, id]
        );
        return (result?.affectedRows ?? 0) > 0;
    }
}