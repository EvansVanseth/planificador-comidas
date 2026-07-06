import { PlanningRepository } from '../../infrastructure/repositories/planning-repository.interface';
import { AppError } from '../shared/errors/app-error';
import { randomUUID } from 'crypto';

export class AddShoppingItemUseCase {
  constructor(private planningRepository: PlanningRepository) {}

  execute(planningId: string, ingredientId: string): void {
    const planning = this.planningRepository.findById(planningId);
    if (!planning) throw new AppError('El Id del planning no existe');
    planning.addShoppingItem(randomUUID(), ingredientId);
    this.planningRepository.save(planning);
  }
}
