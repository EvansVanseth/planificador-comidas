import { PlanningRepository } from '../../infrastructure/repositories/planning-repository.interface';
import { AppError } from '../shared/errors/app-error';

export class RemoveShoppingItemUseCase {
  constructor(private planningRepository: PlanningRepository) {}

  execute(planningId: string, ingredientId: string): void {
    const planning = this.planningRepository.findById(planningId);
    if (!planning) throw new AppError('El Id del planning no existe');
    planning.removeShoppingItem(ingredientId);
    this.planningRepository.save(planning);
  }
}
