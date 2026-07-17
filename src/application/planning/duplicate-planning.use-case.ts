import { randomUUID } from 'crypto';
import { PlanningRepository } from '../../domain/planning/repositories/planning-repository.interface';
import { Planning, PlanningPrimitives } from '@/domain/planning/aggregates/planning.aggregate';
import { AppError } from '../shared/errors/app-error';

export class DuplicatePlanningUseCase {
  constructor(private planningRepository: PlanningRepository) {}

  async execute(planningId: string, userId: string): Promise<string> {
    const original = await this.planningRepository.findById(planningId);
    if (!original) throw new AppError('Planificacion no encontrada');

    const primitives = original.toPrimitives();
    const newId = randomUUID();

    let clonedName = `${primitives.name} (Copia)`;
    let counter = 2;
    while (await this.planningRepository.findByName(clonedName)) {
      clonedName = `${primitives.name} (Copia ${counter})`;
      counter++;
    }

    const cloned: PlanningPrimitives = {
      ...primitives,
      id: newId,
      name: clonedName,
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
    await this.planningRepository.save(planning);
    return newId;
  }
}
