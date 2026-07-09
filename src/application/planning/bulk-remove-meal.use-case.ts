import { PlanningRepository } from '../../domain/planning/repositories/planning-repository.interface';
import { AppError } from '../shared/errors/app-error';

export type BulkRemoveMealInput = {
  planningId: string;
  days: number[];
  momentTagId: string;
};

export class BulkRemoveMealUseCase {
  constructor(private planningRepository: PlanningRepository) {}

  execute(input: BulkRemoveMealInput): void {
    const planning = this.planningRepository.findById(input.planningId);
    if (!planning) throw new AppError('El Id del planning no existe');

    planning.removeMealFromDays(input.days, input.momentTagId);
    this.planningRepository.save(planning);
  }
}
