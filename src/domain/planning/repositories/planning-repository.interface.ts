import { Planning } from "@/domain/planning/aggregates/planning.aggregate"

export interface PlanningRepository {
  findById(Id: string): Promise<Planning | null>;
  findAll(): Promise<Planning[]>;
  findAllByUserId(userId: string): Promise<Planning[]>;
  findByName(name: string): Promise<Planning | null>;
  save(planning: Planning | null): Promise<void>;
  setPantryItemCovers(planningId: string, ingredientId: string, covers: number): Promise<void>;
  setShoppingItemCompleted(planningId: string, ingredientId: string, completed: boolean): Promise<void>;
  delete(id: string): Promise<void>;
}