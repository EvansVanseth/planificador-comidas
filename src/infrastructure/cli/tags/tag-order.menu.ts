import prompts from 'prompts';
import { IContainer } from '../../container';
import { AppError } from '../../../application/shared/errors/app-error';
import { DomainError } from '../../../domain/shared/errors/domain-error';

const ON_CANCEL = () => {};

function mostrarOrden(tags: { id: string; name: string; order?: number }[]) {
  console.log('\n--- Orden actual (MOMENTO_DIA) ---');
  tags.forEach((t, i) => console.log(`  ${i + 1}. ${t.name} (orden: ${t.order})`));
  console.log();
}

export async function reordenarMomentos(container: IContainer, userId: string) {
  try {
    let continuar = true;
    while (continuar) {
      const allTags = await container.listTags.execute(userId);
      const momentTags = allTags
        .filter(t => t.dimension === 'MOMENTO_DIA')
        .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

      if (momentTags.length < 2) {
        console.log('Se necesitan al menos 2 etiquetas MOMENTO_DIA para reordenar');
        return;
      }

      mostrarOrden(momentTags);

      const seleccion = await prompts({
        type: 'select',
        name: 'id',
        message: 'Selecciona la etiqueta a mover:',
        choices: [
          { title: '(Volver)', value: '__back__' },
          ...momentTags.map(t => ({ title: `${t.name} (orden ${t.order})`, value: t.id })),
        ],
      }, { onCancel: ON_CANCEL });

      if (!seleccion?.id || seleccion.id === '__back__') {
        continuar = false;
        continue;
      }

      const idx = momentTags.findIndex(t => t.id === seleccion.id);
      const actions: { title: string; value: string }[] = [
        { title: '(Cancelar)', value: '__cancel__' },
      ];
      if (idx > 0) actions.push({ title: '⬆ Subir', value: 'up' });
      if (idx < momentTags.length - 1) actions.push({ title: '⬇ Bajar', value: 'down' });

      const accion = await prompts({
        type: 'select',
        name: 'value',
        message: `¿Que quieres hacer con "${momentTags[idx].name}"?`,
        choices: actions,
      }, { onCancel: ON_CANCEL });

      if (!accion?.value || accion.value === '__cancel__') continue;

      if (accion.value === 'up') {
        await container.tagOrderMoveUp.execute(seleccion.id);
        console.log('✓ Etiqueta subida una posicion');
      } else {
        await container.tagOrderMoveDown.execute(seleccion.id);
        console.log('✓ Etiqueta bajada una posicion');
      }
    }
  } catch (error) {
    if (error instanceof DomainError || error instanceof AppError) {
      console.log('✗ ' + error.message);
    }
    console.log('\n--- Reordenacion cancelada ---');
  }
}
