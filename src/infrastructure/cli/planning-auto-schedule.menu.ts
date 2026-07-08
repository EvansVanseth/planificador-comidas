import prompts from 'prompts';
import { IContainer } from '../container';
import { AppError } from '../../application/shared/errors/app-error';
import { DomainError } from '../../domain/shared/errors/domain-error';
import { TagDimension } from '../../domain/recipes/value-objects/tag-dimension.enum';

const ON_CANCEL = () => {};

export async function autoPlanificar(container: IContainer, userId: string) {
  try {
    const plannings = container.listPlannings.execute(userId);
    if (plannings.length === 0) {
      console.log('No hay planificaciones');
      return;
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

    if (!resp?.id || resp.id === '__cancel__') return;

    const confirm = await prompts({
      type: 'confirm',
      name: 'value',
      message: '¿Ejecutar autoplanificacion? Se asignaran recetas a los servicios vacios.',
      initial: true,
    }, { onCancel: ON_CANCEL });

    if (!confirm?.value) {
      console.log('Autoplanificacion cancelada');
      return;
    }

    const allRecipes = container.listRecipes.execute(userId);
    const allTags = container.listTags.execute(userId);
    const momentTags = allTags.filter(t => t.dimension === TagDimension.MOMENTO_DIA);

    const result = container.autoSchedule.execute({ planningId: resp.id, userId });

    const assigned = result.assignments.length;
    const failed = result.unassigned.length;
    console.log(`\n--- Autoplanificacion completada ---`);
    console.log(`${assigned} servicio(s) asignados, ${failed} sin asignar`);

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

    console.log('');

  } catch (error) {
    if (error instanceof DomainError || error instanceof AppError) {
      console.log('✗ ' + error.message);
    }
    console.log('\n--- Autoplanificacion cancelada ---');
  }
}
