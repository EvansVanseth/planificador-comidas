import { PlanningRepository } from '../../infrastructure/repositories/planning-repository.interface';
import { AppError } from '../shared/errors/app-error';

export class RemoveMealFromDayUseCase {
  constructor(private planningRepository: PlanningRepository) {}

  execute(planningId: string, ordenDia: number, momentTagId: string): void {
    const planning = this.planningRepository.findById(planningId);
    if (!planning) throw new AppError('El Id del planning no existe');

    planning.removeMealFromDay(ordenDia, momentTagId);
    this.planningRepository.save(planning);
  }
}
