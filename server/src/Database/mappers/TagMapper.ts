import { RowDataPacket } from 'mysql2';
import { Tag } from '../../Domain/models/Tag';

export const TAG_FIELDS ='id, name';
export function mapTag(r: RowDataPacket): Tag{
    return new Tag(
        r.id, r.name );
}