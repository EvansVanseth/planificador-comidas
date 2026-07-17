import { PlanningRepository } from '../../domain/planning/repositories/planning-repository.interface';
import { AppError } from '../shared/errors/app-error';

export type BulkAddMissingServiceInput = {
  planningId: string;
  momentTagId: string;
  covers: number;
  exclusions?: string[];
  preferences?: string[];
};

export class BulkAddMissingServiceUseCase {
  constructor(private planningRepository: PlanningRepository) {}

  async execute(input: BulkAddMissingServiceInput): Promise<number> {
    const planning = await this.planningRepository.findById(input.planningId);
    if (!planning) throw new AppError('El Id del planning no existe');

    const count = planning.addMissingServiceToAllDays(
      input.momentTagId,
      input.covers,
      input.exclusions,
      input.preferences,
    );
    await this.planningRepository.save(planning);
    return count;
  }
}
