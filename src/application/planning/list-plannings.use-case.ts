import { PlanningRepository } from '../../infrastructure/repositories/planning-repository.interface'
import { Planning } from '@/domain/planning/aggregates/planning.aggregate';

export class ListPlanningsUseCase {
  constructor(private planningRepository: PlanningRepository) {}

  execute(): Planning[] {
    return this.planningRepository.findAll();
  }
}