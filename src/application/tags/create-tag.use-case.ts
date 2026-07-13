import { TagRepository } from '../../domain/tags/repositories/tag-repository.interface';
import { Tag } from '@/domain/tags/aggregates/tag.aggregate';
import { TagDimension } from '@/domain/recipes/value-objects/tag-dimension.enum';
import { AppError } from '../shared/errors/app-error';
import { randomUUID } from 'crypto';

export class CreateTagUseCase {
  constructor(private tagRepository: TagRepository) {}

  execute(userId: string, name: string, dimension: TagDimension, isSystem: boolean = false, order: number = 0): string {
    const existing = this.tagRepository.findByNameAndDimension(name, dimension);
    if (existing) {
      throw new AppError(`Ya existe una etiqueta con el nombre "${name}" en la dimensión ${dimension}`);
    }

    const id = randomUUID();
    const tag = Tag.create(id, userId, name, dimension, isSystem, undefined, order);
    this.tagRepository.save(tag);
    return id;
  }
}
