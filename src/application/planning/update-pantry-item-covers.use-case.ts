import { PlanningRepository } from '../../domain/planning/repositories/planning-repository.interface';
import { AppError } from '../shared/errors/app-error';
import { randomUUID } from 'crypto';

export class UpdatePantryItemCoversUseCase {
  constructor(private planningRepository: PlanningRepository) {}

  async execute(planningId: string, ingredientId: string, covers: number): Promise<void> {
    const planning = await this.planningRepository.findById(planningId);
    if (!planning) throw new AppError('El Id del planning no existe');

    const exists = planning.getPantryItems().some(p => p.getIngredientId() === ingredientId);
    if (!exists && covers > 0) {
      planning.addPantryItem(randomUUID(), ingredientId);
    }
    if (exists || covers > 0) {
      planning.updatePantryItemCovers(ingredientId, covers);
    }

    await this.planningRepository.save(planning);
  }
}
