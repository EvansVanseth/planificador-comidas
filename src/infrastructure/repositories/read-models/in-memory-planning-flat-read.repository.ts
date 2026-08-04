import {
  PlanningFlatReadRepository,
  PlanningSnapshotFlat,
} from '@/domain/planning/repositories/planning-flat-read-repository.interface';
import { PlanningRepository } from '@/domain/planning/repositories/planning-repository.interface';

export class InMemoryPlanningFlatReadRepository implements PlanningFlatReadRepository {
  constructor(private planningRepository: PlanningRepository) {}

  async getSnapshot(planningId: string): Promise<PlanningSnapshotFlat | null> {
    const planning = await this.planningRepository.findById(planningId);
    if (!planning) return null;

    const services: PlanningSnapshotFlat['services'] = [];
    for (const day of planning.getDays()) {
      const dto = day.toDTO();
      for (const service of Object.values(dto.services)) {
        if (service?.getRecipeId()) {
          services.push({ recipeId: service.getRecipeId()!, covers: service.getCovers() });
        }
      }
    }

    return {
      services,
      pantryItems: planning.getPantryItems().map((p) => ({
        ingredientId: p.getIngredientId(),
        available: p.isAvailable(),
        covers: p.getCovers(),
      })),
      shoppingItems: planning.getShoppingItems().map((s) => ({
        ingredientId: s.getIngredientId(),
        completed: s.isCompleted(),
      })),
    };
  }
}
