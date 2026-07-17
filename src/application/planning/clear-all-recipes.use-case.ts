import { PlanningRepository } from '../../domain/planning/repositories/planning-repository.interface';
import { AppError } from '../shared/errors/app-error';

export class ClearAllRecipesUseCase {
  constructor(private planningRepository: PlanningRepository) {}

  async execute(planningId: string): Promise<number> {
    const planning = await this.planningRepository.findById(planningId);
    if (!planning) throw new AppError('El Id del planning no existe');

    const count = planning.clearAllRecipesFromAllServices();
    await this.planningRepository.save(planning);
    return count;
  }
}
