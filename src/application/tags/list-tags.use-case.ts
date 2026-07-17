import { TagRepository } from '../../domain/tags/repositories/tag-repository.interface';
import { TagPrimitives } from '@/domain/tags/aggregates/tag.aggregate';

export class ListTagsUseCase {
  constructor(private tagRepository: TagRepository) {}

  async execute(userId: string): Promise<TagPrimitives[]> {
    const tags = await this.tagRepository.findAllByUserId(userId);
    return tags.map(tag => tag.toPrimitives());
  }
}
