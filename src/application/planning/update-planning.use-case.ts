import { PlanningRepository } from '../../domain/planning/repositories/planning-repository.interface';
import { AppError } from '../shared/errors/app-error';

export type UpdatePlanningInput = {
  id: string;
  name?: string;
  startDate?: Date | null;
  weeks?: number;
  hotColdBalance?: number;
};

export class UpdatePlanningUseCase {
  constructor(private planningRepository: PlanningRepository) {}

  async execute(input: UpdatePlanningInput): Promise<void> {
    const planning = await this.planningRepository.findById(input.id);
    if (!planning) {
      throw new AppError(`Planning not found: ${input.id}`);
    }

    if (input.name !== undefined) {
      const existing = await this.planningRepository.findByName(input.name);
      if (existing && existing.getId() !== input.id) {
        throw new AppError(`Ya existe una planificación con el nombre "${input.name}"`);
      }
      planning.rename(input.name);
    }

    if (input.startDate !== undefined) {
      planning.reSchedule(input.startDate);
    }

    if (input.weeks !== undefined) {
      planning.changeWeeks(input.weeks);
    }

    if (input.hotColdBalance !== undefined) {
      planning.changeHotColdBalance(input.hotColdBalance);
    }

    await this.planningRepository.save(planning);
  }
}
