import { PlanningRepository } from '../../infrastructure/repositories/planning-repository.interface';
import { AppError } from '../shared/errors/app-error';

export class RemoveDayFromPlanningUseCase {
  constructor(private planningRepository: PlanningRepository) {}

  execute(planningId: string, ordenDia: number): void {
    const planning = this.planningRepository.findById(planningId);
    if (!planning) throw new AppError('El Id del planning no existe');

    planning.removeDay(ordenDia);
    this.planningRepository.save(planning);
  }
}
