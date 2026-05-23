import { TagDto } from '../../Domain/DTOs/tags/TagDto';
import { ErrorCode } from '../../Domain/enums/ErrorCode';
import { Tag } from '../../Domain/models/Tag';
import { ITagRepository } from '../../Domain/repositories/tags/ITagRepository';
import { ITagService } from '../../Domain/services/tags/ITagService';
import { ServiceResult } from '../../Domain/types/ServiceResult';
import { CreateTagInput, UpdateTagInput, DeleteTagInput } from '../../Domain/types/inputs/TagInputs';

export class TagService implements ITagService {
    public constructor(private tagRepository: ITagRepository) {}

    async createTag(input: CreateTagInput): Promise<ServiceResult<TagDto>> {
        const created = await this.tagRepository.create(input.name);
        if (!created) {
            return { success: false, message: 'Failed to create tag', errorCode: ErrorCode.INTERNAL_ERROR };
        }
        return { success: true, data: this.toDto(created) };
    }

    async getAllTags(): Promise<ServiceResult<TagDto[]>> {
        const tags = await this.tagRepository.getAll();
        return { success: true, data: tags.map(t => this.toDto(t)) };
    }

    async updateTag(input: UpdateTagInput): Promise<ServiceResult<boolean>> {
        const existing = await this.tagRepository.getById(input.id);
        if (!existing) {
            return { success: false, message: 'Tag not found', errorCode: ErrorCode.NOT_FOUND };
        }

        const result = await this.tagRepository.update(new Tag(input.id, input.name));
        if (!result) {
            return { success: false, message: 'Update failed', errorCode: ErrorCode.INTERNAL_ERROR };
        }

        return { success: true, data: true };
    }

    async deleteTag(input: DeleteTagInput): Promise<ServiceResult<boolean>> {
        const existing = await this.tagRepository.getById(input.id);
        if (!existing) {
            return { success: false, message: 'Tag not found', errorCode: ErrorCode.NOT_FOUND };
        }

        const result = await this.tagRepository.delete(input.id);
        if (!result) {
            return { success: false, message: 'Delete failed', errorCode: ErrorCode.INTERNAL_ERROR };
        }

        return { success: true, data: true };
    }

    private toDto(t: Tag): TagDto {
        return new TagDto(t.id, t.name);
    }
}