import { PlanningRepository } from '../../infrastructure/repositories/planning-repository.interface';
import { AppError } from '../shared/errors/app-error';

export type UpdatePlanningInput = {
  id: string;
  name?: string;
  startDate?: Date | null;
  weeks?: number;
};

export class UpdatePlanningUseCase {
  constructor(private planningRepository: PlanningRepository) {}

  execute(input: UpdatePlanningInput): void {
    const planning = this.planningRepository.findById(input.id);
    if (!planning) {
      throw new AppError(`Planning not found: ${input.id}`);
    }

    if (input.name !== undefined) {
      planning.rename(input.name);
    }

    if (input.startDate !== undefined) {
      planning.reSchedule(input.startDate);
    }

    if (input.weeks !== undefined) {
      planning.changeWeeks(input.weeks);
    }

    this.planningRepository.save(planning);
  }
}
