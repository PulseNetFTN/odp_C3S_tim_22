import { Tag } from "../models/Tag";

export interface ITagRepository {
    create(name: string): Promise<Tag>;
    getAll(): Promise<Tag[]>;
    getById(id: number): Promise<Tag>;
    delete(id: number): Promise<boolean>;
}