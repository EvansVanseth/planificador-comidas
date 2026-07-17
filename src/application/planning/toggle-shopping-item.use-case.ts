import { PlanningRepository } from '../../domain/planning/repositories/planning-repository.interface';
import { AppError } from '../shared/errors/app-error';
import { randomUUID } from 'crypto';

export class ToggleShoppingItemUseCase {
  constructor(private planningRepository: PlanningRepository) {}

  async execute(planningId: string, ingredientId: string, completed: boolean): Promise<void> {
    const planning = await this.planningRepository.findById(planningId);
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

    await this.planningRepository.save(planning);
  }
}
