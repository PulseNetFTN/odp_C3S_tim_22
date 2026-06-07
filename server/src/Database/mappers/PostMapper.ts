import { QueryResultRow } from 'pg';
import { Post } from '../../Domain/models/Post';

export const SELECT_FIELDS = 'id, title, content, media_url, community_id, author_id, created_at, updated_at';

export function mapPost(r: QueryResultRow): Post {
    return new Post(
        r.id, r.title, r.content, r.media_url,
        r.community_id, r.author_id,
        r.created_at, r.updated_at
    );
}
