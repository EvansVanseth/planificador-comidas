import { PlanningRepository } from '../../domain/planning/repositories/planning-repository.interface';
import { AppError } from '../shared/errors/app-error';
import { randomUUID } from 'crypto';

export class ToggleShoppingItemUseCase {
  constructor(private planningRepository: PlanningRepository) {}

  execute(planningId: string, ingredientId: string, completed: boolean): void {
    const planning = this.planningRepository.findById(planningId);
    if (!planning) throw new AppError('El Id del planning no existe');

    if (completed) {
      const exists = planning.getShoppingItems().some(s => s.getIngredientId() === ingredientId);
      if (!exists) {
        planning.addShoppingItem(randomUUID(), ingredientId);
      }
      planning.markShoppingItemAsCompleted(ingredientId);
    } else {
      planning.markShoppingItemAsPending(ingredientId);
    }

    this.planningRepository.save(planning);
  }
}
