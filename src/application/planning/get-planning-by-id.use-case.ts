import { PlanningRepository } from '../../domain/planning/repositories/planning-repository.interface'
import { Planning } from '@/domain/planning/aggregates/planning.aggregate';

export class GetPlanningByIdUseCase {
  constructor(private planningRepository: PlanningRepository) {}

  async execute(id: string): Promise<Planning | null> {
    return this.planningRepository.findById(id);
  }
}
