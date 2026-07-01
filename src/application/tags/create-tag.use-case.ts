import { TagRepository } from '../../infrastructure/repositories/tag-repository.interface';
import { Tag } from '@/domain/tags/aggregates/tag.aggregate';
import { TagDimension } from '@/domain/recipes/value-objects/tag-dimension.enum';
import { randomUUID } from 'crypto';

export class CreateTagUseCase {
  constructor(private tagRepository: TagRepository) {}

  execute(userId: string | null, name: string, dimension: TagDimension): string {
    const id = randomUUID();
    const tag = Tag.create(id, userId, name, dimension);
    this.tagRepository.save(tag);
    return id;
  }
}
