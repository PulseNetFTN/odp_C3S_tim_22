import { Tag } from '../../models/Tag';
import { RepositoryResult } from '../../types/RepositoryResult';

export interface ITagRepository {
    create(name: string): Promise<RepositoryResult<Tag>>;
    update(tag: Tag): Promise<RepositoryResult<Tag>>;
    getAll(): Promise<Tag[]>;
    getById(id: number): Promise<RepositoryResult<Tag>>;
    getByIds(ids: number[]): Promise<Tag[]>;
    delete(id: number): Promise<boolean>;
}
