import { PlanningRepository } from '../../infrastructure/repositories/planning-repository.interface';
import { AppError } from '../shared/errors/app-error';

export class ToggleShoppingItemUseCase {
  constructor(private planningRepository: PlanningRepository) {}

  execute(planningId: string, ingredientId: string, completed: boolean): void {
    const planning = this.planningRepository.findById(planningId);
    if (!planning) throw new AppError('El Id del planning no existe');
    if (completed) {
      planning.markShoppingItemAsCompleted(ingredientId);
    } else {
      planning.markShoppingItemAsPending(ingredientId);
    }
    this.planningRepository.save(planning);
  }
}
