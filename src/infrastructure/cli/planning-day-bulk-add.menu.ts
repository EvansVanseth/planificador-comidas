import prompts from 'prompts';
import { IContainer } from '../container';
import { theme } from './cli-theme';
import { AppError } from '../../application/shared/errors/app-error';
import { DomainError } from '../../domain/shared/errors/domain-error';

const ON_CANCEL = () => {};

export async function agregarDiasEnLote(container: IContainer, planningId: string, weeks: number) {
  try {
    const maxDay = weeks * 7;

    const opcion = await prompts({
      type: 'select',
      name: 'value',
      message: 'Agregar dias en lote:',
      choices: [
        { title: `Todos los dias (1-${maxDay})`,  value: 'all' },
        { title: 'Rango personalizado',            value: 'range' },
        { title: '(Cancelar)',                     value: '__cancel__' },
      ],
    }, { onCancel: ON_CANCEL });

    if (!opcion?.value || opcion.value === '__cancel__') return;

    let orders: number[] = [];

    if (opcion.value === 'all') {
      for (let i = 1; i <= maxDay; i++) orders.push(i);
    } else {
      const desdeResp = await prompts({
        type: 'number',
        name: 'value',
        message: `Desde (1-${maxDay}):`,
        validate: (v: number) => v >= 1 && v <= maxDay ? true : `Debe ser entre 1 y ${maxDay}`,
      }, { onCancel: ON_CANCEL });

      if (!desdeResp) return;

      const hastaResp = await prompts({
        type: 'number',
        name: 'value',
        message: `Hasta (${desdeResp.value}-${maxDay}):`,
        validate: (v: number) => v >= desdeResp.value && v <= maxDay ? true : `Debe ser entre ${desdeResp.value} y ${maxDay}`,
      }, { onCancel: ON_CANCEL });

      if (!hastaResp) return;

      for (let i = desdeResp.value; i <= hastaResp.value; i++) orders.push(i);
    }

    if (orders.length === 0) return;

    container.bulkCreateDays.execute({ planningId, orders });
    console.log(theme.success(`${orders.length} dia(s) agregado(s): ${orders.join(', ')}`));
  } catch (error) {
    if (error instanceof DomainError || error instanceof AppError) {
      console.log(theme.error(error.message));
    }
  }
}
