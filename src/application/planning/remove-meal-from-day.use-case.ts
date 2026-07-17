import { PlanningRepository } from '../../domain/planning/repositories/planning-repository.interface';
import { AppError } from '../shared/errors/app-error';

export class RemoveMealFromDayUseCase {
  constructor(private planningRepository: PlanningRepository) {}

  async execute(planningId: string, ordenDia: number, momentTagId: string): Promise<void> {
    const planning = await this.planningRepository.findById(planningId);
    if (!planning) throw new AppError('El Id del planning no existe');

    planning.removeMealFromDay(ordenDia, momentTagId);
    await this.planningRepository.save(planning);
  }
}
