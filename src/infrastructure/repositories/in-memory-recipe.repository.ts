import { RecipeRepository } from "@/domain/recipes/repositories/recipe-repository.interface";
import { Recipe } from "@/domain/recipes/aggregates/recipe.aggregate";

export class InMemoryRecipeRepository implements RecipeRepository {
  private recipes: Map<string, Recipe> = new Map();

  async findById(id: string): Promise<Recipe | null> {
    return this.recipes.get(id) || null;
  }

  async findAll(): Promise<Recipe[]> {
    return Array.from(this.recipes.values());
  }

  async findAllByUserId(userId: string): Promise<Recipe[]> {
    return (await this.findAll()).filter(r => r.getUserId() === userId);
  }

  async findByName(name: string): Promise<Recipe | null> {
    const normalized = name.toLowerCase().trim();
    return (await this.findAll()).find(r => r.getName().toLowerCase().trim() === normalized) ?? null;
  }

  async save(recipe: Recipe): Promise<void> {
    this.recipes.set(recipe.getId(), recipe);
  }

  async delete(id: string): Promise<void> {
    this.recipes.delete(id);
  }
}
