import { RecipeRepository } from "@/domain/recipes/repositories/recipe-repository.interface";
import { Recipe } from "@/domain/recipes/aggregates/recipe.aggregate";

export class InMemoryRecipeRepository implements RecipeRepository {
  private recipes: Map<string, Recipe> = new Map();

  findById(id: string): Recipe | null {
    return this.recipes.get(id) || null;
  }

  findAll(): Recipe[] {
    return Array.from(this.recipes.values());
  }

  findAllByUserId(userId: string): Recipe[] {
    return this.findAll().filter(r => r.getUserId() === userId);
  }

  findByName(name: string): Recipe | null {
    const normalized = name.toLowerCase().trim();
    return this.findAll().find(r => r.getName().toLowerCase().trim() === normalized) ?? null;
  }

  save(recipe: Recipe): void {
    this.recipes.set(recipe.getId(), recipe);
  }

  delete(id: string): void {
    this.recipes.delete(id);
  }
}
