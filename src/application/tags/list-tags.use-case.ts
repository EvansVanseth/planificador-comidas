import { TagRepository } from '../../infrastructure/repositories/tag-repository.interface';
import { TagPrimitives } from '@/domain/tags/aggregates/tag.aggregate';

export class ListTagsUseCase {
  constructor(private tagRepository: TagRepository) {}

  execute(): TagPrimitives[] {
    const tags = this.tagRepository.findAll();
    return tags.map(tag => tag.toPrimitives());
  }
}
