import * as fs from 'fs';
import * as path from 'path';
import { IngredientRepository } from '@/domain/ingredients/repositories/ingredient-repository.interface';
import { Ingredient, IngredientPrimitives } from '@/domain/ingredients/aggregates/ingredient.aggregate';

export class FileIngredientRepository implements IngredientRepository {
  private readonly filePath: string;

  constructor(fileName: string = 'ingredients-db.json') {
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

  async findAll(): Promise<Ingredient[]> {
    const fileContent = fs.readFileSync(this.filePath, 'utf-8');
    const rawData: IngredientPrimitives[] = JSON.parse(fileContent);
    return rawData.map(data => Ingredient.fromPrimitives(data));
  }

  async findAllByUserId(userId: string): Promise<Ingredient[]> {
    const ingredients = await this.findAll();
    return ingredients.filter(i => i.getUserId() === userId);
  }

  async findByName(name: string): Promise<Ingredient | null> {
    const normalized = name.toLowerCase().trim();
    const ingredients = await this.findAll();
    return ingredients.find(i => i.getName().toLowerCase().trim() === normalized) ?? null;
  }

  async findById(id: string): Promise<Ingredient | null> {
    const ingredients = await this.findAll();
    return ingredients.find(i => i.getId() === id) || null;
  }

  async save(ingredient: Ingredient): Promise<void> {
    const ingredients = await this.findAll();

    const index = ingredients.findIndex(i => i.getId() === ingredient.getId());

    if (index >= 0) {
      ingredients[index] = ingredient;
    } else {
      ingredients.push(ingredient);
    }

    const rawData = ingredients.map(i => i.toPrimitives());
    fs.writeFileSync(this.filePath, JSON.stringify(rawData, null, 2), 'utf-8');
  }

  async delete(id: string): Promise<void> {
    const ingredients = await this.findAll();
    const index = ingredients.findIndex(i => i.getId() === id);
    if (index === -1) return;

    ingredients.splice(index, 1);
    const rawData = ingredients.map(i => i.toPrimitives());
    fs.writeFileSync(this.filePath, JSON.stringify(rawData, null, 2), 'utf-8');
  }
}
