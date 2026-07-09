import { TagRepository } from '../../domain/tags/repositories/tag-repository.interface';
import { TagPrimitives } from '@/domain/tags/aggregates/tag.aggregate';

export class ListTagsUseCase {
  constructor(private tagRepository: TagRepository) {}

  execute(userId: string): TagPrimitives[] {
    const tags = this.tagRepository.findAllByUserId(userId);
    return tags.map(tag => tag.toPrimitives());
  }
}
