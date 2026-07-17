import { IContainer } from '../../container';

export async function listarEtiquetas(container: IContainer, userId: string) {
  const tags = await container.listTags.execute(userId);
  if (tags.length === 0) {
    console.log('No hay etiquetas');
    return;
  }
  console.log('--- Etiquetas ---');
  tags.forEach(t => console.log(`(id: ${t.id}) ${t.name} [${t.dimension}]${t.isSystem ? ' (sistema)' : ''}`));
}
