export type PlanningServiceFlat = {
  recipeId: string;
  covers: number;
};

export type PlanningPantryFlat = {
  ingredientId: string;
  available: boolean;
  covers: number;
};

export type PlanningShoppingFlat = {
  ingredientId: string;
  completed: boolean;
};

export type PlanningSnapshotFlat = {
  services: PlanningServiceFlat[];
  pantryItems: PlanningPantryFlat[];
  shoppingItems: PlanningShoppingFlat[];
};

export interface PlanningFlatReadRepository {
  getSnapshot(planningId: string): Promise<PlanningSnapshotFlat | null>;
}
