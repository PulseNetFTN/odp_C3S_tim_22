import { TagDto } from "../../DTOs/users/TagDto";
import { ServiceResult } from "../../types/ServiceResult";

export interface ITagService {
    getAllTags(): Promise<ServiceResult<TagDto[]>>;
    updateTag(id: number, name: string): Promise<ServiceResult<boolean>>;
    deleteTag(id: number): Promise<ServiceResult<boolean>>;
}
 
 