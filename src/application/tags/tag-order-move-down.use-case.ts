import { TagRepository } from '../../domain/tags/repositories/tag-repository.interface';
import { Tag } from '@/domain/tags/aggregates/tag.aggregate';
import { TagDimension } from '@/domain/recipes/value-objects/tag-dimension.enum';
import { AppError } from '../shared/errors/app-error';

export class TagOrderMoveDownUseCase {
  constructor(private tagRepository: TagRepository) {}

  async execute(tagId: string): Promise<void> {
    const tag = await this.tagRepository.findById(tagId);
    if (!tag) {
      throw new AppError(`Etiqueta no encontrada: ${tagId}`);
    }
    if (tag.getDimension() !== TagDimension.MOMENTO_DIA) {
      throw new AppError('Solo etiquetas de dimensión MOMENTO_DIA pueden reordenarse');
    }

    const allTags = await this.tagRepository.findAll();
    const momentoTags = allTags
      .filter(t => t.getDimension() === TagDimension.MOMENTO_DIA)
      .sort((a, b) => a.getOrder() - b.getOrder());

    const idx = momentoTags.findIndex(t => t.getId() === tagId);
    if (idx === -1 || idx >= momentoTags.length - 1) {
      throw new AppError('La etiqueta ya está en la última posición');
    }

    const below = momentoTags[idx + 1];
    const currentOrder = tag.getOrder();
    const belowOrder = below.getOrder();

    tag.changeOrder(belowOrder);
    below.changeOrder(currentOrder);

    await this.tagRepository.save(tag);
    await this.tagRepository.save(below);
  }
}
