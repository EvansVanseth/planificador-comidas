import { IContainer } from '../container';
import { AppError } from '../../application/shared/errors/app-error';
import { Planning } from '../../domain/planning/aggregates/planning.aggregate';
import { TagDimension } from '../../domain/recipes/value-objects/tag-dimension.enum';

function formatDate(d: Date): string {
  const locale = 'es-ES';
  const dayName = d.toLocaleDateString(locale, { weekday: 'short' });
  const dayNum = d.toLocaleDateString(locale, { day: 'numeric' });
  const month = d.toLocaleDateString(locale, { month: 'numeric' });
  return `${dayName} ${dayNum}/${month}`;
}

export function mostrarPlanificacion(
  planning: Planning,
  allRecipes: { id: string; name: string }[],
  allTags: { id: string; name: string; dimension: string }[],
) {
  const days = planning.getDays().sort((a, b) => a.getOrdenDia() - b.getOrdenDia());
  const recipeName = (id: string | null) => id ? (allRecipes.find(r => r.id === id)?.name ?? id) : null;
  const momentTags = allTags.filter(t => t.dimension === TagDimension.MOMENTO_DIA);
  const startDate = planning.getStartDate();

  const hcb = planning.getHotColdBalance();
  const balanceInfo = hcb === 50 ? '' : `, balance: ${hcb}% caliente`;
  const dateInfo = startDate ? ` — Inicio: ${formatDate(startDate)}` : ' (sin fecha)';
  console.log(`\n(id: ${planning.getId()}) ${planning.getName()} — ${planning.getWeeks()} semanas, ${days.length} dias${balanceInfo}${dateInfo}`);
  days.forEach(d => {
    const services = d.toDTO().services;
    const mealEntries = Object.entries(services).filter(([_, s]) => s !== null) as [string, NonNullable<typeof services[string]>][];

    const info = mealEntries.map(([tagId, meal]) => {
      const tag = momentTags.find(t => t.id === tagId);
      const tagName = tag ? tag.name : tagId;
      const name = recipeName(meal.getRecipeId());
      return `${tagName}: ${meal.getCovers()} comensales${name ? ` — ${name}` : ''}`;
    }).join(', ');

    const dayDate = startDate ? ` (${formatDate(new Date(startDate.getTime() + (d.getOrdenDia() - 1) * 86400000))})` : '';
    console.log(`  Dia ${d.getOrdenDia()}${dayDate}: ${mealEntries.length} servicio(s) — ${info || 'vacio'}`);
  });
}

export function verIngredientesNecesarios(container: IContainer, planningId: string) {
  try {
    const items = container.getNeededIngredients.execute(planningId);
    if (items.length === 0) {
      console.log('No hay ingredientes necesarios (sin recetas asignadas)');
      return;
    }
    console.log('\n--- Ingredientes necesarios ---');
    items.forEach(i => {
      const recetas = i.recipeNames.join(', ');
      console.log(`  ${i.ingredientName}${i.quantityNote ? ` (${i.quantityNote})` : ''} — ${i.totalCovers} comensales`);
      console.log(`    Recetas: ${recetas}`);
    });
    console.log(`Total: ${items.length} ingredientes\n`);
  } catch (error) {
    if (error instanceof AppError) console.log('✗ ' + error.message);
  }
}

export function verListaCompra(container: IContainer, planningId: string) {
  try {
    const items = container.getShoppingList.execute(planningId);
    if (items.length === 0) {
      console.log('No hay ingredientes en la lista de la compra');
      return;
    }
    console.log('\n--- Lista de la compra ---');
    items.forEach(i => {
      const tag = i.shoppingCompleted ? ' [COMPRADO]' : i.inShoppingList ? '' : '';
      if (i.pantryAvailable) {
        console.log(`  ${i.ingredientName}${i.quantityNote ? ` (${i.quantityNote})` : ''} — ${i.totalCovers} comensales [TENGO DE TODO]${tag}`);
      } else if (i.neededAfterPantry <= 0) {
        console.log(`  ${i.ingredientName}${i.quantityNote ? ` (${i.quantityNote})` : ''} — ${i.totalCovers} comensales [CUBIERTO]${tag}`);
      } else {
        console.log(`  ${i.ingredientName}${i.quantityNote ? ` (${i.quantityNote})` : ''} — necesario para ${i.totalCovers} comensales, tienes para ${i.pantryCovers} → COMPRAR PARA ${i.neededAfterPantry}${tag}`);
      }
    });
    console.log(`Total: ${items.length} ingredientes\n`);
  } catch (error) {
    if (error instanceof AppError) console.log('✗ ' + error.message);
  }
}

export function listarPlanificaciones(container: IContainer, userId: string) {
  const plannings = container.listPlannings.execute(userId);
  if (plannings.length === 0) {
    console.log('No hay planificaciones');
    return;
  }
  const allRecipes = container.listRecipes.execute(userId);
  const allTags = container.listTags.execute(userId);

  console.log('--- Planificaciones ---');

  plannings.forEach(p => mostrarPlanificacion(p, allRecipes, allTags));
}
