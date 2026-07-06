import * as fs from 'fs';
import * as path from 'path';
import { RecipeRepository } from './recipe-repository.interface';
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

  findAll(): Recipe[] {
    const fileContent = fs.readFileSync(this.filePath, 'utf-8');
    const rawData: RecipePrimitives[] = JSON.parse(fileContent);
    return rawData.map(data => Recipe.fromPrimitives(data));
  }

  findAllByUserId(userId: string): Recipe[] {
    return this.findAll().filter(r => r.getUserId() === userId);
  }

  findByName(name: string): Recipe | null {
    const normalized = name.toLowerCase().trim();
    return this.findAll().find(r => r.getName().toLowerCase().trim() === normalized) ?? null;
  }

  findById(id: string): Recipe | null {
    const recipes = this.findAll();
    return recipes.find(r => r.getId() === id) || null;
  }

  save(recipe: Recipe): void {
    const recipes = this.findAll();

    const index = recipes.findIndex(r => r.getId() === recipe.getId());

    if (index >= 0) {
      recipes[index] = recipe;
    } else {
      recipes.push(recipe);
    }

    const rawData = recipes.map(r => r.toPrimitives());
    fs.writeFileSync(this.filePath, JSON.stringify(rawData, null, 2), 'utf-8');
  }

  delete(id: string): void {
    const recipes = this.findAll();
    const index = recipes.findIndex(r => r.getId() === id);
    if (index === -1) return;

    recipes.splice(index, 1);
    const rawData = recipes.map(r => r.toPrimitives());
    fs.writeFileSync(this.filePath, JSON.stringify(rawData, null, 2), 'utf-8');
  }
}
