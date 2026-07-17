import { PlanningRepository } from '../../domain/planning/repositories/planning-repository.interface';
import { AppError } from '../shared/errors/app-error';

export type BulkRemoveDaysInput = {
  planningId: string;
  orders: number[];
};

export class BulkRemoveDaysUseCase {
  constructor(private planningRepository: PlanningRepository) {}

  async execute(input: BulkRemoveDaysInput): Promise<void> {
    const planning = await this.planningRepository.findById(input.planningId);
    if (!planning) throw new AppError('El Id del planning no existe');

    planning.removeDays(input.orders);
    await this.planningRepository.save(planning);
  }
}
