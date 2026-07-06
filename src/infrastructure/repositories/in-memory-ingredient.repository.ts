import { IngredientRepository } from "@/infrastructure/repositories/ingredient-repository.interface";
import { Ingredient } from "@/domain/ingredients/aggregates/ingredient.aggregate";

export class InMemoryIngredientRepository implements IngredientRepository {
  private ingredients: Map<string, Ingredient> = new Map();

  findById(id: string): Ingredient | null {
    return this.ingredients.get(id) || null;
  }

  findAll(): Ingredient[] {
    return Array.from(this.ingredients.values());
  }

  findAllByUserId(userId: string): Ingredient[] {
    return this.findAll().filter(i => i.getUserId() === userId);
  }

  findByName(name: string): Ingredient | null {
    const normalized = name.toLowerCase().trim();
    return this.findAll().find(i => i.getName().toLowerCase().trim() === normalized) ?? null;
  }

  save(ingredient: Ingredient): void {
    this.ingredients.set(ingredient.getId(), ingredient);
  }

  delete(id: string): void {
    this.ingredients.delete(id);
  }
}
