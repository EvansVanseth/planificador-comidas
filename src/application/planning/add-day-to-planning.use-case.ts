import { PlanningRepository } from '../../domain/planning/repositories/planning-repository.interface';
import { AppError } from '../shared/errors/app-error';
import { randomUUID } from 'crypto';

export class AddDayToPlanningUseCase {
  constructor(private planningRepository: PlanningRepository) {}

  execute(planningId: string, ordenDia: number): string {
    const planning = this.planningRepository.findById(planningId);
    if (!planning) throw new AppError('El Id del planning no existe');

    const dayId = randomUUID();
    planning.addDay(dayId, ordenDia);
    this.planningRepository.save(planning);

    return dayId;
  }
}
