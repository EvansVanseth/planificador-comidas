import { PlanningRepository } from '../../infrastructure/repositories/planning-repository.interface';
import { TagRepository } from '../../infrastructure/repositories/tag-repository.interface';
import { TagDimension } from '@/domain/recipes/value-objects/tag-dimension.enum';
import { AppError } from '../shared/errors/app-error';

export class SetMealPreferencesUseCase {
  constructor(
    private planningRepository: PlanningRepository,
    private tagRepository: TagRepository,
  ) {}

  execute(planningId: string, orderDay: number, momentTagId: string, preferences: string[]): void {
    const planning = this.planningRepository.findById(planningId);
    if (!planning) throw new AppError('El Id del planning no existe');

    const dayDTO = planning.getDay(orderDay);
    if (!dayDTO) throw new AppError('No existe un día con ese orden');

    const meal = dayDTO.services[momentTagId];
    if (!meal) throw new AppError('No existe un servicio en ese momento del día');

    this.validarSinMomentoDia(preferences);

    meal.setPreferences(preferences);
    this.planningRepository.save(planning);
  }

  private validarSinMomentoDia(tagIds: string[]): void {
    for (const tagId of tagIds) {
      const tag = this.tagRepository.findById(tagId);
      if (tag && tag.getDimension() === TagDimension.MOMENTO_DIA) {
        throw new AppError(`No se puede usar la etiqueta de momento del día "${tag.getName()}" como preferencia`);
      }
    }
  }
}
