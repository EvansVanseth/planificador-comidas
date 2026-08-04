import { PlanningFlatReadRepository } from '../../domain/planning/repositories/planning-flat-read-repository.interface';
import { RecipeFlatReadRepository } from '../../domain/recipes/repositories/recipe-flat-read-repository.interface';
import { IngredientFlatReadRepository } from '../../domain/ingredients/repositories/ingredient-flat-read-repository.interface';
import { AppError } from '../shared/errors/app-error';
import { projectNeededIngredients } from './needed-ingredients.projection';
import { ShoppingListEntry } from './get-shopping-list.use-case';

export type { ShoppingListEntry };

export class GetShoppingListViewUseCase {
  constructor(
    private planningFlatReadRepository: PlanningFlatReadRepository,
    private recipeFlatReadRepository: RecipeFlatReadRepository,
    private ingredientFlatReadRepository: IngredientFlatReadRepository,
  ) {}

  async execute(planningId: string): Promise<ShoppingListEntry[]> {
    const snapshot = await this.planningFlatReadRepository.getSnapshot(planningId);
    if (!snapshot) throw new AppError('El Id del planning no existe');

    const recipeIds = [...new Set(snapshot.services.map((s) => s.recipeId))];
    const recipeIngredients = await this.recipeFlatReadRepository.getIngredientsByRecipeIds(recipeIds);

    const ingredientIds = [...new Set(recipeIngredients.map((r) => r.ingredientId))];
    const ingredientNames = await this.ingredientFlatReadRepository.findNamesByIds(ingredientIds);
    const ingredientNameById = new Map(ingredientNames.map((n) => [n.id, n.name]));

    const base = projectNeededIngredients(snapshot.services, recipeIngredients, ingredientNameById);

    // Cruzar con pantry y shopping list de la planificación
    const pantryByIngredient = new Map(snapshot.pantryItems.map((p) => [p.ingredientId, p]));
    const shoppingByIngredient = new Map(snapshot.shoppingItems.map((s) => [s.ingredientId, s]));

    const result: ShoppingListEntry[] = base.map((entry) => {
      const pantryItem = pantryByIngredient.get(entry.ingredientId);
      const pantryAvailable = pantryItem?.available ?? false;
      const pantryCovers = pantryItem?.covers ?? 0;
      const shopItem = shoppingByIngredient.get(entry.ingredientId);

      return {
        ...entry,
        pantryCovers,
        pantryAvailable,
        neededAfterPantry: pantryAvailable ? 0 : Math.max(0, entry.totalCovers - pantryCovers),
        inShoppingList: !!shopItem,
        shoppingCompleted: shopItem?.completed ?? false,
      };
    });

    result.sort((a, b) => a.ingredientName.localeCompare(b.ingredientName));
    return result;
  }
}
