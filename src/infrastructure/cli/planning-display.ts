import { IContainer } from '../container';
import { Planning } from '../../domain/planning/aggregates/planning.aggregate';
import { TagDimension } from '../../domain/recipes/value-objects/tag-dimension.enum';

export function mostrarPlanificacion(
  planning: Planning,
  allRecipes: { id: string; name: string }[],
  allTags: { id: string; name: string; dimension: string }[],
) {
  const days = planning.getDays();
  const recipeName = (id: string | null) => id ? (allRecipes.find(r => r.id === id)?.name ?? id) : null;
  const momentTags = allTags.filter(t => t.dimension === TagDimension.MOMENTO_DIA);

  console.log(`\n(id: ${planning.getId()}) ${planning.getName()} — ${planning.getWeeks()} semanas, ${days.length} dias`);
  days.forEach(d => {
    const services = d.toDTO().services;
    const mealEntries = Object.entries(services).filter(([_, s]) => s !== null) as [string, NonNullable<typeof services[string]>][];

    const info = mealEntries.map(([tagId, meal]) => {
      const tag = momentTags.find(t => t.id === tagId);
      const tagName = tag ? tag.name : tagId;
      const name = recipeName(meal.getRecipeId());
      return `${tagName}: ${meal.getCovers()} comensales${name ? ` — ${name}` : ''}`;
    }).join(', ');

    console.log(`  Dia ${d.getOrdenDia()}: ${mealEntries.length} servicio(s) — ${info || 'vacio'}`);
  });
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
