import { PlanningRepository } from '../../infrastructure/repositories/planning-repository.interface';
import { AppError } from '../shared/errors/app-error';

export class DeletePlanningUseCase {
  constructor(private planningRepository: PlanningRepository) {}

  execute(id: string): void {
    const planning = this.planningRepository.findById(id);
    if (!planning) {
      throw new AppError(`Planning not found: ${id}`);
    }
    this.planningRepository.delete(id);
  }
}
