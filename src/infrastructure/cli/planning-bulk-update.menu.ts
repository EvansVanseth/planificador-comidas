import prompts from 'prompts';
import { IContainer } from '../container';
import { TagDimension } from '../../domain/recipes/value-objects/tag-dimension.enum';
import { mostrarPlanificacion } from './planning-display';
import { AppError } from '../../application/shared/errors/app-error';
import { DomainError } from '../../domain/shared/errors/domain-error';

const ON_CANCEL = () => {};

export async function editarEnLote(container: IContainer, userId: string, planningId: string) {
  try {
    const planning = container.listPlannings.execute(userId).find(p => p.getId() === planningId);
    if (!planning) { console.log('Planificacion no encontrada'); return; }

    const days = planning.getDays();
    if (days.length === 0) {
      console.log('No hay dias. Agrega un dia primero.');
      return;
    }

    mostrarPlanificacion(planning, container.listRecipes.execute(userId), container.listTags.execute(userId));

    const seleccionDias = await prompts({
      type: 'multiselect',
      name: 'days',
      message: 'Selecciona los dias a editar (ESPACIO para marcar, ENTER para confirmar):',
      choices: days.map(d => ({
        title: `Dia ${d.getOrdenDia()} (${d.toDTO().services ? Object.keys(d.toDTO().services).filter(k => d.toDTO().services[k]).length : 0} servicios)`,
        value: d.getOrdenDia(),
      })),
      instructions: false,
    }, { onCancel: ON_CANCEL });

    if (!seleccionDias?.days || seleccionDias.days.length === 0) return;

    const daysList: number[] = seleccionDias.days;

    let covers: number | undefined;
    const cambiarCovers = await prompts({
      type: 'confirm',
      name: 'value',
      message: '¿Cambiar comensales?',
      initial: false,
    }, { onCancel: ON_CANCEL });

    if (cambiarCovers?.value) {
      const coversResp = await prompts({
        type: 'number',
        name: 'value',
        message: 'Nuevos comensales para todos los servicios:',
        validate: (v: number) => v >= 0 ? true : 'Debe ser un numero positivo',
      }, { onCancel: ON_CANCEL });

      if (coversResp !== undefined) {
        covers = coversResp.value;
      }
    }

    let exclusions: string[] | undefined;
    const cambiarExclusions = await prompts({
      type: 'confirm',
      name: 'value',
      message: '¿Cambiar exclusiones?',
      initial: false,
    }, { onCancel: ON_CANCEL });

    if (cambiarExclusions?.value) {
      const allTags = container.listTags.execute(userId).filter(
        t => t.dimension !== TagDimension.MOMENTO_DIA
      );
      const exclResp = await prompts({
        type: 'multiselect',
        name: 'tags',
        message: 'Selecciona etiquetas a excluir (ESPACIO para marcar, ENTER para confirmar - vacio limpia exclusiones):',
        choices: allTags.map(t => ({
          title: `${t.name} (${t.dimension})`,
          value: t.id,
        })),
        instructions: false,
      }, { onCancel: ON_CANCEL });

      if (exclResp?.tags) {
        exclusions = exclResp.tags;
      }
    }

    let preferences: string[] | undefined;
    const cambiarPrefs = await prompts({
      type: 'confirm',
      name: 'value',
      message: '¿Cambiar preferencias?',
      initial: false,
    }, { onCancel: ON_CANCEL });

    if (cambiarPrefs?.value) {
      const allTags = container.listTags.execute(userId).filter(
        t => t.dimension !== TagDimension.MOMENTO_DIA
      );
      const prefResp = await prompts({
        type: 'multiselect',
        name: 'tags',
        message: 'Selecciona etiquetas como preferidas (ESPACIO para marcar, ENTER para confirmar - vacio limpia preferencias):',
        choices: allTags.map(t => ({
          title: `${t.name} (${t.dimension})`,
          value: t.id,
        })),
        instructions: false,
      }, { onCancel: ON_CANCEL });

      if (prefResp?.tags) {
        preferences = prefResp.tags;
      }
    }

    if (covers === undefined && exclusions === undefined && preferences === undefined) {
      console.log('No se seleccionaron cambios');
      return;
    }

    const confirmar = await prompts({
      type: 'confirm',
      name: 'value',
      message: `¿Aplicar cambios a ${daysList.length} dia(s)?`,
      initial: true,
    }, { onCancel: ON_CANCEL });

    if (!confirmar?.value) {
      console.log('Operacion cancelada');
      return;
    }

    container.bulkUpdateDays.execute({ planningId, days: daysList, covers, exclusions, preferences });
    console.log(`Dias actualizados: ${daysList.join(', ')}`);
  } catch (error) {
    if (error instanceof DomainError || error instanceof AppError) {
      console.log('✗ ' + error.message);
    }
  }
}
