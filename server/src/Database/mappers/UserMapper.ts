import { QueryResultRow } from 'pg';
import { User } from '../../Domain/models/User';

export const USER_FIELDS = 'id, username, email, first_name, last_name, bio, profile_image, role, password_hash, created_at';
export const USER_FIELDS_PUBLIC = 'id, username, email, first_name, last_name, bio, profile_image, role';

export function mapUser(r: QueryResultRow): User {
    return new User(
        r.id, r.username, r.email, r.first_name, r.last_name,
        r.bio, r.profile_image, r.role, r.password_hash ?? '',
        r.created_at ? new Date(r.created_at) : null
    );
}