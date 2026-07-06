import * as fs from 'fs';
import * as path from 'path';
import { IngredientRepository } from './ingredient-repository.interface';
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

  findAll(): Ingredient[] {
    const fileContent = fs.readFileSync(this.filePath, 'utf-8');
    const rawData: IngredientPrimitives[] = JSON.parse(fileContent);
    return rawData.map(data => Ingredient.fromPrimitives(data));
  }

  findAllByUserId(userId: string): Ingredient[] {
    return this.findAll().filter(i => i.getUserId() === userId);
  }

  findById(id: string): Ingredient | null {
    const ingredients = this.findAll();
    return ingredients.find(i => i.getId() === id) || null;
  }

  save(ingredient: Ingredient): void {
    const ingredients = this.findAll();

    const index = ingredients.findIndex(i => i.getId() === ingredient.getId());

    if (index >= 0) {
      ingredients[index] = ingredient;
    } else {
      ingredients.push(ingredient);
    }

    const rawData = ingredients.map(i => i.toPrimitives());
    fs.writeFileSync(this.filePath, JSON.stringify(rawData, null, 2), 'utf-8');
  }

  delete(id: string): void {
    const ingredients = this.findAll();
    const index = ingredients.findIndex(i => i.getId() === id);
    if (index === -1) return;

    ingredients.splice(index, 1);
    const rawData = ingredients.map(i => i.toPrimitives());
    fs.writeFileSync(this.filePath, JSON.stringify(rawData, null, 2), 'utf-8');
  }
}
