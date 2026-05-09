import { Tag } from "../../models/Tag";
import { CreateTagInput,GetByIdTagInput, DeleteTagInput } from "../../types/inputs/TagsInputs";

export interface ITagRepository {
    create(input:CreateTagInput): Promise<Tag>;
    getAll(): Promise<Tag[]>;
    getById(input: GetByIdTagInput): Promise<Tag>;
    delete(input: DeleteTagInput): Promise<boolean>;
}