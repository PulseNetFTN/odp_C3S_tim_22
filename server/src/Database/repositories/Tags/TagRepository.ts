import { ResultSetHeader, RowDataPacket } from "mysql2";
import { Tag } from "../../../Domain/models/Tag";
import { ITagRepository } from '../../../Domain/repositories/Tags/ITagRepository';
import { getReadConnection, getWriteConnection } from "../../connection/DbConnectionPool";


export class TagRepository implements ITagRepository{
       async create(name: string): Promise<Tag> {
        try {
            const conn = getWriteConnection();
            if (!conn.success || !conn.data) return new Tag();
            const [result] = await conn.data.execute<ResultSetHeader>(
                'INSERT INTO tags ( name) VALUES ( ?)',
                [name]
            );
            if (result.insertId) {
                return new Tag(result.insertId, name);
            }
            return new Tag();
        } catch {
            return new Tag();
        }
    }

    async getAll(): Promise<Tag[]>
    {
                try {
            const conn = getReadConnection();
            if (!conn.success || !conn.data) return [];
            const [rows] = await conn.data.execute<RowDataPacket[]>(
                'SELECT id, name FROM tags ORDER BY id ASC'
            );
            return rows.map(r => new Tag(r.id, r.name));
        } catch {
            return [];
        }
    }
     async getById(id: number): Promise<Tag> {
            try {
                const conn = getReadConnection();
                if (!conn.success || !conn.data) return new Tag();
                const [rows] = await conn.data.execute<RowDataPacket[]>(
                    'SELECT id, name FROM tags WHERE id = ?',
                    [id]
                );
                if (rows.length > 0) {
                    const r = rows[0];
                    return new Tag(r.id, r.name);
                }
                return new Tag();
            } catch {
                return new Tag();
            }
        }
    async delete(id: number): Promise<boolean>
    {
        try {
            const conn = getWriteConnection();
            if (!conn.success || !conn.data) return false;
            const [result] = await conn.data.execute<ResultSetHeader>(
                'DELETE FROM tags WHERE id = ?',
                [id]
            );
            return result.affectedRows > 0;
        } catch {
            return false;
        }
    }
}