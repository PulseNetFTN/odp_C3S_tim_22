import { TagDto } from "../../Domain/DTOs/users/TagDto";
import { Tag } from "../../Domain/models/Tag";
import { ITagRepository } from "../../Domain/repositories/Tags/ITagRepository";
import { ITagService } from "../../Domain/services/tags/ITagService";
import { ServiceResult } from "../../Domain/types/ServiceResult";

export class TagService implements ITagService {
public constructor(private tagRepository: ITagRepository) {}

    async updateTag(id:number, name: string): Promise<ServiceResult<boolean>>
    {
        const tag: Tag = await this.tagRepository.getById(id);

        if(tag.id==0)return{
            success: false,
            message: 'Tag Not Found'
        };
        
       return{

        success:true,
        message: 'Tag Deleted'
       }

    }
    async getAllTags(): Promise<ServiceResult<TagDto[]>>
    {
        const tags: Tag[] = await this.tagRepository.getAll();
               return {
                   success: true,
                   data: tags.map(t => new TagDto(t.id, t.name)),
               };
    }
    async deleteTag(id: number): Promise<ServiceResult<boolean>>
    {
        const tagExists: boolean = await this.tagRepository.delete(id);

        if(!tagExists)return {
            success: false,
            data: false

        }
        else return {
            success: true,
            data: true
        };
    }
}