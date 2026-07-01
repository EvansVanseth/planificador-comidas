import { TagRepository } from '../../infrastructure/repositories/tag-repository.interface';
import { AppError } from '../shared/errors/app-error';
import { TagDimension } from '@/domain/recipes/value-objects/tag-dimension.enum';

export type UpdateTagInput = {
  id: string;
  name?: string;
  userId?: string | null;
  dimension?: TagDimension;
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

    this.tagRepository.save(tag);
  }
}
