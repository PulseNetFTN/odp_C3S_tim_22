import { TagDto } from "../../DTOs/users/TagDto";
import { ServiceResult } from "../../types/ServiceResult";

export interface ITagService {
    createTag(name: string): Promise<ServiceResult<TagDto>>;
    getAllTags(): Promise<ServiceResult<TagDto[]>>;
    deleteTag(id: number): Promise<ServiceResult<boolean>>;
}
 
 