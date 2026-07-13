import { TagRepository } from '../../domain/tags/repositories/tag-repository.interface';
import { Tag } from '@/domain/tags/aggregates/tag.aggregate';
import { TagDimension } from '@/domain/recipes/value-objects/tag-dimension.enum';
import { AppError } from '../shared/errors/app-error';

export class TagOrderMoveUpUseCase {
  constructor(private tagRepository: TagRepository) {}

  execute(tagId: string): void {
    const tag = this.tagRepository.findById(tagId);
    if (!tag) {
      throw new AppError(`Etiqueta no encontrada: ${tagId}`);
    }
    if (tag.getDimension() !== TagDimension.MOMENTO_DIA) {
      throw new AppError('Solo etiquetas de dimensión MOMENTO_DIA pueden reordenarse');
    }

    const momentoTags = this.tagRepository
      .findAll()
      .filter(t => t.getDimension() === TagDimension.MOMENTO_DIA)
      .sort((a, b) => a.getOrder() - b.getOrder());

    const idx = momentoTags.findIndex(t => t.getId() === tagId);
    if (idx <= 0) {
      throw new AppError('La etiqueta ya está en la primera posición');
    }

    const above = momentoTags[idx - 1];
    const currentOrder = tag.getOrder();
    const aboveOrder = above.getOrder();

    tag.changeOrder(aboveOrder);
    above.changeOrder(currentOrder);

    this.tagRepository.save(tag);
    this.tagRepository.save(above);
  }
}
