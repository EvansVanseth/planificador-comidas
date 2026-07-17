import { PlanningRepository } from '../../domain/planning/repositories/planning-repository.interface';
import { TagRepository } from '../../domain/tags/repositories/tag-repository.interface';
import { TagDimension } from '@/domain/recipes/value-objects/tag-dimension.enum';
import { AppError } from '../shared/errors/app-error';

export class SetMealPreferencesUseCase {
  constructor(
    private planningRepository: PlanningRepository,
    private tagRepository: TagRepository,
  ) {}

  async execute(planningId: string, orderDay: number, momentTagId: string, preferences: string[]): Promise<void> {
    const planning = await this.planningRepository.findById(planningId);
    if (!planning) throw new AppError('El Id del planning no existe');

    const dayDTO = planning.getDay(orderDay);
    if (!dayDTO) throw new AppError('No existe un día con ese orden');

    const meal = dayDTO.services[momentTagId];
    if (!meal) throw new AppError('No existe un servicio en ese momento del día');

    await this.validarSinMomentoDia(preferences);

    meal.setPreferences(preferences);
    await this.planningRepository.save(planning);
  }

  private async validarSinMomentoDia(tagIds: string[]): Promise<void> {
    for (const tagId of tagIds) {
      const tag = await this.tagRepository.findById(tagId);
      if (tag && tag.getDimension() === TagDimension.MOMENTO_DIA) {
        throw new AppError(`No se puede usar la etiqueta de momento del día "${tag.getName()}" como preferencia`);
      }
    }
  }
}
