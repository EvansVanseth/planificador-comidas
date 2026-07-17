import * as fs from 'fs';
import * as path from 'path';
import { RecipeRepository } from '@/domain/recipes/repositories/recipe-repository.interface';
import { Recipe, RecipePrimitives } from '@/domain/recipes/aggregates/recipe.aggregate';

export class FileRecipeRepository implements RecipeRepository {
  private readonly filePath: string;

  constructor(fileName: string = 'recipes-db.json') {
    this.filePath = path.resolve(process.cwd(), 'file-persistence', fileName);
    this.initializeFile();
  }

  private initializeFile(): void {
    const dir = path.dirname(this.filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    if (!fs.existsSync(this.filePath)) {
      fs.writeFileSync(this.filePath, JSON.stringify([]), 'utf-8');
    }
  }

  async findAll(): Promise<Recipe[]> {
    const fileContent = fs.readFileSync(this.filePath, 'utf-8');
    const rawData: RecipePrimitives[] = JSON.parse(fileContent);
    return rawData.map(data => Recipe.fromPrimitives(data));
  }

  async findAllByUserId(userId: string): Promise<Recipe[]> {
    return (await this.findAll()).filter(r => r.getUserId() === userId);
  }

  async findByName(name: string): Promise<Recipe | null> {
    const normalized = name.toLowerCase().trim();
    return (await this.findAll()).find(r => r.getName().toLowerCase().trim() === normalized) ?? null;
  }

  async findById(id: string): Promise<Recipe | null> {
    const recipes = await this.findAll();
    return recipes.find(r => r.getId() === id) || null;
  }

  async save(recipe: Recipe): Promise<void> {
    const recipes = await this.findAll();

    const index = recipes.findIndex(r => r.getId() === recipe.getId());

    if (index >= 0) {
      recipes[index] = recipe;
    } else {
      recipes.push(recipe);
    }

    const rawData = recipes.map(r => r.toPrimitives());
    fs.writeFileSync(this.filePath, JSON.stringify(rawData, null, 2), 'utf-8');
  }

  async delete(id: string): Promise<void> {
    const recipes = await this.findAll();
    const index = recipes.findIndex(r => r.getId() === id);
    if (index === -1) return;

    recipes.splice(index, 1);
    const rawData = recipes.map(r => r.toPrimitives());
    fs.writeFileSync(this.filePath, JSON.stringify(rawData, null, 2), 'utf-8');
  }
}
