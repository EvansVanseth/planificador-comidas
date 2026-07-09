import prompts from 'prompts';
import { IContainer } from '../../container';
import { AppError } from '../../../application/shared/errors/app-error';
import { DomainError } from '../../../domain/shared/errors/domain-error';

const ON_CANCEL = () => {};

export async function editarDatosPlanificacion(container: IContainer, planningId: string, userId: string) {
  try {
    const planning = container.listPlannings.execute(userId).find(p => p.getId() === planningId);
    if (!planning) {
      console.log('Planificacion no encontrada');
      return;
    }

    const cambios = await prompts([
      { type: 'text', name: 'name', message: 'Nuevo nombre (dejar vacio para mantener):' },
      { type: 'number', name: 'weeks', message: 'Nuevas semanas (0 para mantener):', initial: 0 },
      {
        type: 'select',
        name: 'startDateAction',
        message: 'Fecha de inicio:',
        choices: [
          { title: planning.getStartDate() ? `Cambiar (${planning.getStartDate()!.toLocaleDateString()})` : 'Asignar', value: 'set' },
          { title: 'Quitar', value: 'clear' },
          { title: '(sin cambios)', value: 'keep' },
        ],
      },
    ], { onCancel: ON_CANCEL });

    if (!cambios) return;

    const input: any = { id: planningId };
    if (cambios.name.trim()) input.name = cambios.name.trim();
    if (cambios.weeks > 0) input.weeks = cambios.weeks;

    if (cambios.startDateAction === 'set') {
      const dateResp = await prompts({
        type: 'date',
        name: 'value',
        message: 'Selecciona el lunes de inicio:',
        initial: planning.getStartDate() ?? new Date(),
        validate: (v: Date) => v.getDay() === 1 ? true : 'Debe ser lunes',
      }, { onCancel: ON_CANCEL });
      if (dateResp?.value) input.startDate = dateResp.value;
    } else if (cambios.startDateAction === 'clear') {
      input.startDate = null;
    }

    const changeBalance = await prompts({
      type: 'confirm',
      name: 'value',
      message: `¿Cambiar balance frio/caliente (actual: ${planning.getHotColdBalance()})?`,
      initial: false,
    }, { onCancel: ON_CANCEL });

    if (changeBalance?.value) {
      const balanceResp = await prompts({
        type: 'number',
        name: 'value',
        message: 'Nuevo balance (0=todo frio, 100=todo caliente):',
        initial: planning.getHotColdBalance(),
        min: 0,
        max: 100,
      }, { onCancel: ON_CANCEL });
      if (balanceResp?.value !== undefined) input.hotColdBalance = balanceResp.value;
    }

    container.updatePlanning.execute(input);
  } catch (error) {
    if (error instanceof DomainError || error instanceof AppError) {
      console.log('✗ ' + error.message);
    }
    console.log('\n--- Edicion cancelada ---');
  }
}
