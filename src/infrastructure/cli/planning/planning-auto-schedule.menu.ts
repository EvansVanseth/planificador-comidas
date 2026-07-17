import prompts from 'prompts';
import { IContainer } from '../../container';
import { AppError } from '../../../application/shared/errors/app-error';
import { DomainError } from '../../../domain/shared/errors/domain-error';
import { TagDimension } from '../../../domain/recipes/value-objects/tag-dimension.enum';
import { PlannerResult } from '@/application/planning/ports/auto-planner.interface';
import { TagPrimitives } from '@/domain/tags/aggregates/tag.aggregate';
import { RecipePrimitives } from '@/domain/recipes/aggregates/recipe.aggregate';

const ON_CANCEL = () => {};

async function seleccionarPlanificacion(container: IContainer, userId: string): Promise<string | null> {
  const plannings = await container.listPlannings.execute(userId);
  if (plannings.length === 0) {
    console.log('No hay planificaciones');
    return null;
  }

  const resp = await prompts({
    type: 'select',
    name: 'id',
    message: 'Selecciona la planificacion a autoplanificar:',
    choices: [
      { title: '(Cancelar)', value: '__cancel__' },
      ...plannings.map(p => ({ title: `${p.getName()} (${p.getWeeks()} semanas)`, value: p.getId() })),
    ],
  }, { onCancel: ON_CANCEL });

  if (!resp?.id || resp.id === '__cancel__') return null;
  return resp.id;
}

function mostrarResultado(result: PlannerResult, allRecipes: RecipePrimitives[], momentTags: TagPrimitives[]) {
  console.log(`\n${result.assignments.length} servicio(s) asignados, ${result.unassigned.length} sin asignar`);

  if (result.assignments.length > 0) {
    console.log('\nAsignaciones:');
    for (const a of result.assignments) {
      const tagName = momentTags.find(t => t.id === a.momentTagId)?.name ?? a.momentTagId;
      const recipeName = allRecipes.find(r => r.id === a.recipeId)?.name ?? a.recipeId;
      console.log(`  Dia ${a.dayOrder} — ${tagName}: ${recipeName}`);
    }
  }

  if (result.unassigned.length > 0) {
    console.log('\nNo se pudo asignar:');
    for (const u of result.unassigned) {
      const tagName = momentTags.find(t => t.id === u.momentTagId)?.name ?? u.momentTagId;
      console.log(`  Dia ${u.dayOrder} — ${tagName}: ${u.reason}`);
    }
  }
}

export async function autoPlanificar(container: IContainer, userId: string, planningId?: string) {
  try {
    const id = planningId ?? await seleccionarPlanificacion(container, userId);
    if (!id) return;

    const allRecipes = await container.listRecipes.execute(userId);
    const allTags = await container.listTags.execute(userId);
    const momentTags = allTags.filter(t => t.dimension === TagDimension.MOMENTO_DIA);

    const preview = await container.autoSchedule.execute({ planningId: id, userId, dryRun: true });

    if (preview.assignments.length === 0) {
      console.log('\n--- Vista previa: no se pudo asignar ningun servicio ---');
      mostrarResultado(preview, allRecipes, momentTags);
      console.log('');
      return;
    }

    console.log('\n--- Vista previa de autoplanificacion ---');
    mostrarResultado(preview, allRecipes, momentTags);

    const confirm = await prompts({
      type: 'confirm',
      name: 'value',
      message: '\n¿Aplicar estas asignaciones?',
      initial: true,
    }, { onCancel: ON_CANCEL });

    if (!confirm?.value) {
      console.log('Autoplanificacion cancelada');
      return;
    }

    await container.autoSchedule.execute({ planningId: id, userId });

    console.log('\n--- Autoplanificacion aplicada ---');

  } catch (error) {
    if (error instanceof DomainError || error instanceof AppError) {
      console.log('✗ ' + error.message);
    }
    console.log('\n--- Autoplanificacion cancelada ---');
  }
}
