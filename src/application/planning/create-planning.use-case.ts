import { PlanningRepository } from '../../domain/planning/repositories/planning-repository.interface';
import { Planning } from '@/domain/planning/aggregates/planning.aggregate';
import { AppError } from '../shared/errors/app-error';
import { randomUUID } from 'crypto';

export class CreatePlanningUseCase {
  constructor(private planningRepository: PlanningRepository) {}

  async execute(userId: string, name: string, startDate: Date | null, weeks: number, hotColdBalance?: number): Promise<string> {
    const existing = await this.planningRepository.findByName(name);
    if (existing) {
      throw new AppError(`Ya existe una planificación con el nombre "${name}"`);
    }

    const id = randomUUID();
    const planning = Planning.create(id, userId, name, startDate, weeks, hotColdBalance);

    await this.planningRepository.save(planning);
    return id;
  }
}
