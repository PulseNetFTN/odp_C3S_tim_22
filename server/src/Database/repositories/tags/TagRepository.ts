import { Tag } from '../../../Domain/models/Tag';
import { ITagRepository } from '../../../Domain/repositories/tags/ITagRepository';
import { BaseRepository } from '../BaseRepository';
import { mapTag, TAG_FIELDS } from '../../mappers/TagMapper';
import { RepositoryResult } from '../../../Domain/types/RepositoryResult';

export class TagRepository extends BaseRepository implements ITagRepository {

    async create(name: string): Promise<RepositoryResult<Tag>> {
        const result = await this.executeWrite(
            'INSERT INTO tags (name) VALUES ($1) RETURNING id',
            [name]
        );
        if (!result.ok) return RepositoryResult.failure(result.message);
        if (!result.data.insertId) return RepositoryResult.failure('Insert returned no ID');
        return RepositoryResult.success(new Tag(result.data.insertId, name));
    }

    async update(tag: Tag): Promise<RepositoryResult<Tag>> {
        const result = await this.executeWrite(
            'UPDATE tags SET name = $1 WHERE id = $2',
            [tag.name, tag.id]
        );
        if (!result.ok) return RepositoryResult.failure(result.message);
        if (result.data.affectedRows === 0) return RepositoryResult.notFound('Tag not found for update');
        return RepositoryResult.success(tag);
    }

    async getAll(): Promise<Tag[]> {
        return this.executeRead(`SELECT ${TAG_FIELDS} FROM tags ORDER BY id ASC`, [], mapTag);
    }

    async getById(id: number): Promise<RepositoryResult<Tag>> {
        return this.executeReadOne(`SELECT ${TAG_FIELDS} FROM tags WHERE id = $1`, [id], mapTag);
    }

    async getByIds(ids: number[]): Promise<Tag[]> {
        if (!ids || ids.length === 0) return [];
        const placeholders = this.buildPlaceholders(ids);
        return this.executeRead(
            `SELECT ${TAG_FIELDS} FROM tags WHERE id IN (${placeholders})`,
            ids,
            mapTag
        );
    }

    async delete(id: number): Promise<boolean> {
        const result = await this.executeWrite('DELETE FROM tags WHERE id = $1', [id]);
        return result.ok && result.data.affectedRows > 0;
    }
}
