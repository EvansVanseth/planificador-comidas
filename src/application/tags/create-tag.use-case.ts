import { TagRepository } from '../../domain/tags/repositories/tag-repository.interface';
import { Tag } from '@/domain/tags/aggregates/tag.aggregate';
import { TagDimension } from '@/domain/recipes/value-objects/tag-dimension.enum';
import { AppError } from '../shared/errors/app-error';
import { randomUUID } from 'crypto';

export class CreateTagUseCase {
  constructor(private tagRepository: TagRepository) {}

  async execute(userId: string, name: string, dimension: TagDimension, isSystem: boolean = false, order?: number): Promise<string> {
    const existing = await this.tagRepository.findByNameAndDimension(name, dimension);
    if (existing) {
      throw new AppError(`Ya existe una etiqueta con el nombre "${name}" en la dimensión ${dimension}`);
    }

    let effectiveOrder = order;
    if (effectiveOrder === undefined && dimension === TagDimension.MOMENTO_DIA) {
      const userTags = await this.tagRepository.findAllByUserId(userId);
      const momentTags = userTags.filter(t => t.getDimension() === TagDimension.MOMENTO_DIA);
      const maxOrder = momentTags.reduce((max, t) => Math.max(max, t.getOrder()), 0);
      effectiveOrder = maxOrder + 1;
    }
    effectiveOrder ??= 0;

    const id = randomUUID();
    const tag = Tag.create(id, userId, name, dimension, isSystem, undefined, effectiveOrder);
    await this.tagRepository.save(tag);
    return id;
  }
}
