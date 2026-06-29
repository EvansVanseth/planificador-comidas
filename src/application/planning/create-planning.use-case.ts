// src/application/planning/create-planning.use-case.ts
import { PlanningRepository } from '../../infrastructure/repositories/planning-repository.interface';
import { Planning } from '@/domain/planning/aggregates/planning.aggregate';
import { randomUUID } from 'crypto'; 

export class CreatePlanningUseCase {
  constructor(private planningRepository: PlanningRepository) {}

  execute(name: string, startDate: Date | null, weeks: number): string {
    const id = randomUUID();
    const planning = Planning.create(id, name, startDate, weeks);
    
    this.planningRepository.save(planning);
    return id; // Devolvemos el ID generado
  }
}