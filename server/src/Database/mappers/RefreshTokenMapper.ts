import { QueryResultRow } from 'pg';
import { RefreshToken } from '../../Domain/models/RefreshToken';

export function mapRefreshToken(r: QueryResultRow): RefreshToken {
    return new RefreshToken(r.id, r.user_id, r.token_hash, new Date(r.expires_at), new Date(r.created_at));
}