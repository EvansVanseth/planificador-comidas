import { PlanningRepository } from '../../domain/planning/repositories/planning-repository.interface'
import { Planning } from '@/domain/planning/aggregates/planning.aggregate';

export class ListPlanningsUseCase {
  constructor(private planningRepository: PlanningRepository) {}

  async execute(userId: string): Promise<Planning[]> {
    return this.planningRepository.findAllByUserId(userId);
  }
}