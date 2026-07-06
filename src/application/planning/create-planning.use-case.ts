import { PlanningRepository } from '../../infrastructure/repositories/planning-repository.interface';
import { Planning } from '@/domain/planning/aggregates/planning.aggregate';
import { AppError } from '../shared/errors/app-error';
import { randomUUID } from 'crypto';

export class CreatePlanningUseCase {
  constructor(private planningRepository: PlanningRepository) {}

  execute(userId: string, name: string, startDate: Date | null, weeks: number): string {
    const existing = this.planningRepository.findByName(name);
    if (existing) {
      throw new AppError(`Ya existe una planificación con el nombre "${name}"`);
    }

    const id = randomUUID();
    const planning = Planning.create(id, userId, name, startDate, weeks);

    this.planningRepository.save(planning);
    return id;
  }
}