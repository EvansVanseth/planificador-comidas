import { PlanningRepository } from '../../infrastructure/repositories/planning-repository.interface';
import { AppError } from '../shared/errors/app-error';

export type BulkRemoveDaysInput = {
  planningId: string;
  orders: number[];
};

export class BulkRemoveDaysUseCase {
  constructor(private planningRepository: PlanningRepository) {}

  execute(input: BulkRemoveDaysInput): void {
    const planning = this.planningRepository.findById(input.planningId);
    if (!planning) throw new AppError('El Id del planning no existe');

    planning.removeDays(input.orders);
    this.planningRepository.save(planning);
  }
}
