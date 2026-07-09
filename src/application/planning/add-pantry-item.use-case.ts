import { PlanningRepository } from '../../domain/planning/repositories/planning-repository.interface';
import { AppError } from '../shared/errors/app-error';
import { randomUUID } from 'crypto';

export class AddPantryItemUseCase {
  constructor(private planningRepository: PlanningRepository) {}

  execute(planningId: string, ingredientId: string): void {
    const planning = this.planningRepository.findById(planningId);
    if (!planning) throw new AppError('El Id del planning no existe');
    planning.addPantryItem(randomUUID(), ingredientId);
    this.planningRepository.save(planning);
  }
}
