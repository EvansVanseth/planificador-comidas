import { PlanningRepository } from '../../domain/planning/repositories/planning-repository.interface';
import { AppError } from '../shared/errors/app-error';

export class DeletePlanningUseCase {
  constructor(private planningRepository: PlanningRepository) {}

  async execute(id: string): Promise<void> {
    const planning = await this.planningRepository.findById(id);
    if (!planning) {
      throw new AppError(`Planning not found: ${id}`);
    }
    await this.planningRepository.delete(id);
  }
}
