import { MealTime } from '@/domain/planning/entities/meal-time.enum';
import { PlanningRepository } from '../../infrastructure/repositories/planning-repository.interface'
import { AppError } from '../shared/errors/app-error';

export class AssignMealUseCase {
  constructor(private planningRepository: PlanningRepository) {}

  execute(planningId: string, orderDay: number, time: MealTime, recipeId: string, covers: number) {
    const planning = this.planningRepository.findById(planningId);
    if (planning === null) throw new AppError('El Id del planning no existe'); 
    planning.assignMealToDay(orderDay, time, recipeId, covers);
    this.planningRepository.save(planning);
  }
}