import prompts from 'prompts';
import { IContainer } from '../../container';
import { AppError } from '../../../application/shared/errors/app-error';

const ON_CANCEL = () => {};

export async function eliminarEtiqueta(container: IContainer, userId: string) {
  try {
    const tags = container.listTags.execute(userId).filter(t => !t.isSystem);
    if (tags.length === 0) {
      console.log('No hay etiquetas de usuario para eliminar');
      return;
    }

    const seleccion = await prompts({
      type: 'select',
      name: 'id',
      message: 'Selecciona la etiqueta a eliminar:',
      choices: [
        { title: '(Cancelar)', value: '__cancel__' },
        ...tags.map(t => ({ title: `${t.name} [${t.dimension}]`, value: t.id })),
      ],
    }, { onCancel: ON_CANCEL });

    if (!seleccion?.id || seleccion.id === '__cancel__') return;
    const tagId = seleccion.id;
    const tagName = tags.find(t => t.id === tagId)?.name ?? tagId;

    const recipes = container.listRecipes.execute(userId);
    const recipesWithTag = recipes.filter(r => r.tags.some(t => t.id === tagId));
    const planningCount = contarPlanificacionesConEtiqueta(container, userId, tagId);

    if (recipesWithTag.length > 0 || planningCount > 0) {
      console.log(`\nLa etiqueta "${tagName}" está en uso:`);
      if (recipesWithTag.length > 0) {
        console.log(`  - ${recipesWithTag.length} receta(s) la tienen asignada`);
        recipesWithTag.forEach(r => console.log(`    · ${r.name}`));
      }
      if (planningCount > 0) {
        console.log(`  - Referenciada en servicios de ${planningCount} planificación(es)`);
      }

      const confirm = await prompts({
        type: 'confirm',
        name: 'value',
        message: '¿Eliminar la etiqueta de todas las referencias y borrarla?',
        initial: false,
      }, { onCancel: ON_CANCEL });

      if (!confirm?.value) {
        console.log('Operación cancelada');
        return;
      }
    }

    const result = container.deleteTag.execute(tagId);
    console.log('✓ Etiqueta eliminada correctamente');
    if (result.recipesAffected > 0) {
      console.log(`  - Eliminada de ${result.recipesAffected} receta(s)`);
    }
    if (result.planningsAffected > 0) {
      console.log(`  - ${result.planningsAffected} planificación(es) afectada(s)`);
    }
    if (result.servicesRemoved > 0) {
      console.log(`  - ${result.servicesRemoved} servicio(s) eliminado(s) de planificaciones`);
    }

  } catch (error) {
    if (error instanceof AppError) console.log('✗ ' + error.message);
    console.log('\n--- Operacion cancelada ---');
  }
}

function contarPlanificacionesConEtiqueta(container: IContainer, userId: string, tagId: string): number {
  const plannings = container.listPlannings.execute(userId);
  let count = 0;
  for (const planning of plannings) {
    for (const day of planning.getDays()) {
      const dto = day.toDTO();
      for (const [momentTagId, service] of Object.entries(dto.services)) {
        if (service === null) continue;
        if (momentTagId === tagId || service.getExclusions().includes(tagId) || service.getPreferences().includes(tagId)) {
          count++;
          break;
        }
      }
    }
  }
  return count;
}
