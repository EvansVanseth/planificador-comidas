import { IngredientRepository } from "@/domain/ingredients/repositories/ingredient-repository.interface";
import { Ingredient } from "@/domain/ingredients/aggregates/ingredient.aggregate";

export class InMemoryIngredientRepository implements IngredientRepository {
  private ingredients: Map<string, Ingredient> = new Map();

  async findById(id: string): Promise<Ingredient | null> {
    return this.ingredients.get(id) || null;
  }

  async findAll(): Promise<Ingredient[]> {
    return Array.from(this.ingredients.values());
  }

  async findAllByUserId(userId: string): Promise<Ingredient[]> {
    return (await this.findAll()).filter(i => i.getUserId() === userId);
  }

  async findByName(name: string, userId: string): Promise<Ingredient | null> {
    const normalized = name.toLowerCase().trim();
    const ingredients = await this.findAll();
    return ingredients.find(i => i.getName().toLowerCase().trim() === normalized && i.getUserId() === userId) ?? null;
  }

  async save(ingredient: Ingredient): Promise<void> {
    this.ingredients.set(ingredient.getId(), ingredient);
  }

  async delete(id: string): Promise<void> {
    this.ingredients.delete(id);
  }
}
