// Repository interfaces
import { PlanningRepository } from '@/infrastructure/repositories/planning-repository.interface';
//Repository implementations
import { InMemoryPlanningRepository } from './repositories/in-memory-planning.repository';
import { FilePlanningRepository } from './repositories/file-planning.repository';
//Use-cases
import { CreatePlanningUseCase } from '@/application/planning/create-planning.use-case';
import { AssignMealUseCase } from '@/application/planning/assign-meal.use-case';
import { ListPlanningsUseCase } from '@/application/planning/list-plannings.use-case';

export type RepositoryType = 'memory' | 'file';

export interface IContainer {
  listPlannings: ListPlanningsUseCase,
  createPlanning: CreatePlanningUseCase,
  assignMeal: AssignMealUseCase
}

export const createContainer = (mode: RepositoryType = 'memory') => {

  let repository: PlanningRepository;

  switch (mode) {
    case 'file':
      repository = new FilePlanningRepository('planning-data.json');
      break;
    case 'memory':
    default:
      repository = new InMemoryPlanningRepository();
      break;
  }

  return {
    listPlannings: new ListPlanningsUseCase(repository),
    createPlanning: new CreatePlanningUseCase(repository),
    assignMeal: new AssignMealUseCase(repository),
  }

};
