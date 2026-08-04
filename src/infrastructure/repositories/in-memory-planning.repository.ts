import { PlanningRepository } from "@/domain/planning/repositories/planning-repository.interface";
import { Planning } from "@/domain/planning/aggregates/planning.aggregate";
import { randomUUID } from 'crypto';

export class InMemoryPlanningRepository implements PlanningRepository {
  private plannings: Map<string, Planning> = new Map();

  async findById(id: string): Promise<Planning | null> {
    return this.plannings.get(id) || null;
  }

  async findAll(): Promise<Planning[]> {
    return Array.from(this.plannings.values());
  }

  async findAllByUserId(userId: string): Promise<Planning[]> {
    return (await this.findAll()).filter(p => p.getUserId() === userId);
  }

  async findByName(name: string): Promise<Planning | null> {
    const normalized = name.toLowerCase().trim();
    return (await this.findAll()).find(p => p.getName().toLowerCase().trim() === normalized) ?? null;
  }

  async save(planning: Planning): Promise<void> {
    this.plannings.set(planning.getId(), planning);
  }

  async setPantryItemCovers(planningId: string, ingredientId: string, covers: number): Promise<void> {
    const planning = this.plannings.get(planningId);
    if (!planning) return;

    const exists = planning.getPantryItems().some(p => p.getIngredientId() === ingredientId);
    if (!exists && covers > 0) {
      planning.addPantryItem(randomUUID(), ingredientId);
    }
    if (exists || covers > 0) {
      planning.updatePantryItemCovers(ingredientId, covers);
    }
  }

  async setPantryItemAvailable(planningId: string, ingredientId: string, available: boolean): Promise<void> {
    const planning = this.plannings.get(planningId);
    if (!planning) return;

    const exists = planning.getPantryItems().some(p => p.getIngredientId() === ingredientId);
    if (!exists && available) {
      planning.addPantryItem(randomUUID(), ingredientId);
    }
    if (exists) {
      if (available) {
        planning.markPantryItemAsAvailable(ingredientId);
      } else {
        planning.updatePantryItemCovers(ingredientId, 0);
      }
    }
  }

  async removePantryItem(planningId: string, ingredientId: string): Promise<void> {
    const planning = this.plannings.get(planningId);
    if (!planning) return;

    if (planning.getPantryItems().some(p => p.getIngredientId() === ingredientId)) {
      planning.removePantryItem(ingredientId);
    }
  }

  async setShoppingItemCompleted(planningId: string, ingredientId: string, completed: boolean): Promise<void> {
    const planning = this.plannings.get(planningId);
    if (!planning) return;

    const exists = planning.getShoppingItems().some(s => s.getIngredientId() === ingredientId);
    if (!exists && completed) {
      planning.addShoppingItem(randomUUID(), ingredientId);
    }
    if (exists) {
      if (completed) {
        planning.markShoppingItemAsCompleted(ingredientId);
      } else {
        planning.markShoppingItemAsPending(ingredientId);
      }
    }
  }

  async removeShoppingItem(planningId: string, ingredientId: string): Promise<void> {
    const planning = this.plannings.get(planningId);
    if (!planning) return;

    if (planning.getShoppingItems().some(s => s.getIngredientId() === ingredientId)) {
      planning.removeShoppingItem(ingredientId);
    }
  }

  async delete(id: string): Promise<void> {
    this.plannings.delete(id);
  }
}