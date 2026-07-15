import { PlanningRepository } from '../../domain/planning/repositories/planning-repository.interface';
import { AppError } from '../shared/errors/app-error';

export class ClearAllRecipesUseCase {
  constructor(private planningRepository: PlanningRepository) {}

  execute(planningId: string): number {
    const planning = this.planningRepository.findById(planningId);
    if (!planning) throw new AppError('El Id del planning no existe');

    const count = planning.clearAllRecipesFromAllServices();
    this.planningRepository.save(planning);
    return count;
  }
}
