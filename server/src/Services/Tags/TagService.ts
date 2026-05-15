import { TagDto } from "../../Domain/DTOs/users/TagDto";
import { ErrorCode } from "../../Domain/enums/ErrorCode";
import { Tag } from "../../Domain/models/Tag";
import { ITagRepository } from "../../Domain/repositories/Tags/ITagRepository";
import { ITagService } from "../../Domain/services/tags/ITagService";
import { DeleteTagInput, UpdateTagInput } from "../../Domain/types/inputs/TagInputs";
import { ServiceResult } from "../../Domain/types/ServiceResult";

export class TagService implements ITagService {
public constructor(private tagRepository: ITagRepository) {}

    async updateTag(input: UpdateTagInput): Promise<ServiceResult<boolean>>
    {
        const existingtag = await this.tagRepository.getById(input.id);
        if(!existingtag)return {success:false,message: 'Tag not found', errorCode: ErrorCode.NOT_FOUND};

        const result = await this.tagRepository.update(new Tag (input.id,input.name)); 
        if(!result)
            {
                return {success: false,message:'Name update failed',errorCode: ErrorCode.INTERNAL_ERROR}
            }

            //audit

            return{success: true, data: true};
    }
    async getAllTags(): Promise<ServiceResult<TagDto[]>>
    {
        const tags = await this.tagRepository.getAll();
        return {success: true, data: tags.map(u => this.toDto(u))};
    }

    async deleteTag(input:DeleteTagInput): Promise<ServiceResult<boolean>>
    {
        const tagexists = await this.tagRepository.delete(input.id);

        if(!tagexists) return{ success: false, message:'Tag not found',errorCode:ErrorCode.NOT_FOUND}
        return{ success: true, data:true};
    }

        private toDto(t: Tag): TagDto {
            return new TagDto(t.id, t.name);
        }
}