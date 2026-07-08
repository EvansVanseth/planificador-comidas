import { randomUUID } from 'crypto';
import { PlanningRepository } from '../../infrastructure/repositories/planning-repository.interface';
import { Planning, PlanningPrimitives } from '@/domain/planning/aggregates/planning.aggregate';
import { AppError } from '../shared/errors/app-error';

export class DuplicatePlanningUseCase {
  constructor(private planningRepository: PlanningRepository) {}

  execute(planningId: string, userId: string): string {
    const original = this.planningRepository.findById(planningId);
    if (!original) throw new AppError('Planificacion no encontrada');

    const primitives = original.toPrimitives();
    const newId = randomUUID();

    const cloned: PlanningPrimitives = {
      ...primitives,
      id: newId,
      name: `${primitives.name} (Copia)`,
      startdate: null,
      days: primitives.days.map(day => ({
        ...day,
        id: randomUUID(),
        services: day.services.map(svc => ({
          ...svc,
          time: svc.time,
        })),
      })),
      pantryItems: [],
      shoppingItems: [],
    };

    const planning = Planning.fromPrimitives(cloned);
    this.planningRepository.save(planning);
    return newId;
  }
}
