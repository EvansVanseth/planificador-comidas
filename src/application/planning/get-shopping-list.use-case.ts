import { PlanningRepository } from '../../domain/planning/repositories/planning-repository.interface';
import { RecipeRepository } from '../../domain/recipes/repositories/recipe-repository.interface';
import { IngredientRepository } from '../../domain/ingredients/repositories/ingredient-repository.interface';
import { NeededIngredientEntry, buildNeededIngredients } from './needed-ingredients.projection';
import { AppError } from '../shared/errors/app-error';

export type ShoppingListEntry = NeededIngredientEntry & {
  pantryCovers: number;
  pantryAvailable: boolean;
  neededAfterPantry: number;
  inShoppingList: boolean;
  shoppingCompleted: boolean;
};

export class GetShoppingListUseCase {
  constructor(
    private planningRepository: PlanningRepository,
    private recipeRepository: RecipeRepository,
    private ingredientRepository: IngredientRepository,
  ) {}

  async execute(planningId: string): Promise<ShoppingListEntry[]> {
    const planning = await this.planningRepository.findById(planningId);
    if (!planning) throw new AppError('El Id del planning no existe');

    const base = await buildNeededIngredients(planning, this.recipeRepository, this.ingredientRepository);

    // Cruzar con pantry y shopping list de la planificación
    const pantryByIngredient = new Map(planning.getPantryItems().map(p => [p.getIngredientId(), p]));
    const shoppingByIngredient = new Map(planning.getShoppingItems().map(s => [s.getIngredientId(), s]));

    const result: ShoppingListEntry[] = base.map((entry) => {
      const pantryItem = pantryByIngredient.get(entry.ingredientId);
      const pantryAvailable = pantryItem?.isAvailable() ?? false;
      const pantryCovers = pantryItem?.getCovers() ?? 0;
      const shopItem = shoppingByIngredient.get(entry.ingredientId);

      return {
        ...entry,
        pantryCovers,
        pantryAvailable,
        neededAfterPantry: pantryAvailable ? 0 : Math.max(0, entry.totalCovers - pantryCovers),
        inShoppingList: !!shopItem,
        shoppingCompleted: shopItem?.isCompleted() ?? false,
      };
    });

    result.sort((a, b) => a.ingredientName.localeCompare(b.ingredientName));
    return result;
  }
}
