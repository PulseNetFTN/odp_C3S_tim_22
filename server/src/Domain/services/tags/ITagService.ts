import { TagDto } from '../../DTOs/tags/TagDto';
import { ServiceResult } from '../../types/ServiceResult';
import { CreateTagInput, UpdateTagInput, DeleteTagInput } from '../../types/inputs/TagInputs';

export interface ITagService {
    createTag(input: CreateTagInput): Promise<ServiceResult<TagDto>>;
    getAllTags(): Promise<ServiceResult<TagDto[]>>;
    updateTag(input: UpdateTagInput): Promise<ServiceResult<boolean>>;
    deleteTag(input: DeleteTagInput): Promise<ServiceResult<boolean>>;
}