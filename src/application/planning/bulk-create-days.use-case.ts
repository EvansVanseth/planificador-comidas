import { PlanningRepository } from '../../domain/planning/repositories/planning-repository.interface';
import { AppError } from '../shared/errors/app-error';
import { randomUUID } from 'crypto';

export type BulkCreateDaysInput = {
  planningId: string;
  orders: number[];
};

export class BulkCreateDaysUseCase {
  constructor(private planningRepository: PlanningRepository) {}

  execute(input: BulkCreateDaysInput): void {
    const planning = this.planningRepository.findById(input.planningId);
    if (!planning) throw new AppError('El Id del planning no existe');

    const entries = input.orders.map(o => ({ id: randomUUID(), ordenDia: o }));
    planning.addDays(entries);
    this.planningRepository.save(planning);
  }
}
