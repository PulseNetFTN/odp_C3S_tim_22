import { QueryResultRow } from 'pg';
import { Comment } from '../../Domain/models/Comment';

export const COMMENT_FIELDS = 'id, post_id, author_id, parent_id, content, is_deleted, is_flagged, created_at, updated_at';

export function mapComment(r: QueryResultRow): Comment {
    return new Comment(
        r.id,
        r.post_id,
        r.author_id,
        r.parent_id,
        0,
        r.content,
        r.is_deleted,
        r.is_flagged,
        r.created_at,
        r.updated_at
    );
}
