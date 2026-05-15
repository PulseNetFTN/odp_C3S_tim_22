import { Tag } from "../../models/Tag";

export interface ITagRepository {
    create(name:string): Promise<Tag | null>;
    getAll(): Promise<Tag[]>;
    getById(id:number): Promise<Tag | null>;
    update(tag:Tag): Promise <Tag | null>
    delete(id:number): Promise<boolean>;
}