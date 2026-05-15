import { ResultSetHeader, RowDataPacket } from "mysql2";
import { Tag } from "../../../Domain/models/Tag";
import { ITagRepository } from '../../../Domain/repositories/Tags/ITagRepository';
import { getReadConnection, getWriteConnection } from "../../connection/DbConnectionPool";
import { BaseRepository } from "../BaseRepository";
import { mapTag, TAG_FIELDS } from "../../mappers/TagMapper";


export class TagRepository extends BaseRepository implements ITagRepository{

       async create(name: string): Promise<Tag | null> {
            const result = await this.executeWrite(
                'INSERT INTO tags (name) VALUES (?)',
                [name]
            );
            if (!result?.insertId)
                 return null;
            return new Tag(result.insertId, name);
    }
   
    async update(tag:Tag): Promise<Tag | null> {
       const result = await this.executeWrite(
        'UPDATE tags SET name = ? WHERE id = ?',
        [tag.id,tag.name]
       );
       if(!result || result.affectedRows ===0) return null;
       return tag;
    }
    async getAll(): Promise<Tag[]>
    {
        return this.executeRead(
            'SELECT id, name FROM tags ORDER BY id ASC',[],mapTag);
    }
     async getById(id: number): Promise<Tag | null> {
        return this.executeReadOne(`SELECT ${TAG_FIELDS} FROM tags WHERE id = ?`, [id], mapTag);

        }
    async delete(id: number): Promise<boolean>
    {
        const result = await this.executeWrite(
            'DELETE FROM tags WHERE id = ?',
            [id]
        );
        return (result?.affectedRows ?? 0) > 0;
    }
}