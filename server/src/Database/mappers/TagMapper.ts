import { QueryResultRow } from 'pg';
import { Tag } from '../../Domain/models/Tag';

export const TAG_FIELDS = 'id, name';

export function mapTag(r: QueryResultRow): Tag {
    return new Tag(r.id, r.name);
}
