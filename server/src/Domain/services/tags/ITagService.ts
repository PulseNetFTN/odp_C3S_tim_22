import { TagDto } from "../../DTOs/users/TagDto";
import { ServiceResult } from "../../types/ServiceResult";
import { DeleteTagInput, UpdateTagInput } from "../../types/inputs/TagInputs";

export interface ITagService {
    getAllTags(): Promise<ServiceResult<TagDto[]>>;
    updateTag(input: UpdateTagInput): Promise<ServiceResult<boolean>>;
    deleteTag(input: DeleteTagInput): Promise<ServiceResult<boolean>>;
}
 
 