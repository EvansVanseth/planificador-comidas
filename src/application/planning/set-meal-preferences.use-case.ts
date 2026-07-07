import { PlanningRepository } from '../../infrastructure/repositories/planning-repository.interface';
import { AppError } from '../shared/errors/app-error';

export class SetMealPreferencesUseCase {
  constructor(private planningRepository: PlanningRepository) {}

  execute(planningId: string, orderDay: number, momentTagId: string, preferences: string[]): void {
    const planning = this.planningRepository.findById(planningId);
    if (!planning) throw new AppError('El Id del planning no existe');

    const dayDTO = planning.getDay(orderDay);
    if (!dayDTO) throw new AppError('No existe un día con ese orden');

    const meal = dayDTO.services[momentTagId];
    if (!meal) throw new AppError('No existe un servicio en ese momento del día');

    meal.setPreferences(preferences);
    this.planningRepository.save(planning);
  }
}
