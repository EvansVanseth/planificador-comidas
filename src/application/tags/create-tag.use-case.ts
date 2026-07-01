import { TagRepository } from '../../infrastructure/repositories/tag-repository.interface';
import { Tag } from '@/domain/tags/aggregates/tag.aggregate';
import { TagDimension } from '@/domain/recipes/value-objects/tag-dimension.enum';
import { AppError } from '../shared/errors/app-error';
import { randomUUID } from 'crypto';

export class CreateTagUseCase {
  constructor(private tagRepository: TagRepository) {}

  execute(userId: string | null, name: string, dimension: TagDimension): string {
    const existing = this.tagRepository.findByNameAndDimension(name, dimension);
    if (existing) {
      throw new AppError(`Ya existe una etiqueta con el nombre "${name}" en la dimensión ${dimension}`);
    }

    const id = randomUUID();
    const tag = Tag.create(id, userId, name, dimension);
    this.tagRepository.save(tag);
    return id;
  }
}
