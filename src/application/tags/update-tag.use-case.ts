import { TagRepository } from '../../domain/tags/repositories/tag-repository.interface';
import { AppError } from '../shared/errors/app-error';
import { TagDimension } from '@/domain/recipes/value-objects/tag-dimension.enum';

export type UpdateTagInput = {
  id: string;
  name?: string;
  userId?: string;
  dimension?: TagDimension;
  order?: number;
};

export class UpdateTagUseCase {
  constructor(private tagRepository: TagRepository) {}

  execute(input: UpdateTagInput): void {
    const tag = this.tagRepository.findById(input.id);
    if (!tag) {
      throw new AppError(`Tag not found: ${input.id}`);
    }

    if (input.name !== undefined) {
      const existing = this.tagRepository.findByNameAndDimension(
        input.name,
        input.dimension ?? tag.getDimension(),
      );
      if (existing && existing.getId() !== input.id) {
        throw new AppError(`Ya existe una etiqueta con el nombre "${input.name}" en la dimensión ${input.dimension ?? tag.getDimension()}`);
      }

      tag.rename(input.name);
    }

    if (input.userId !== undefined) {
      tag.reassignUser(input.userId);
    }

    if (input.dimension !== undefined) {
      tag.changeDimension(input.dimension);
    }

    if (input.order !== undefined) {
      tag.changeOrder(input.order);
    }

    this.tagRepository.save(tag);
  }
}
