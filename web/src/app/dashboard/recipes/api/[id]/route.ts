import { NextRequest, NextResponse } from 'next/server';
import { getContainer } from '@/domain-container';
import { TagDimension } from '@/domain/recipes/value-objects/tag-dimension.enum';

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = params.id;
    const body = await req.json();
    const { userId, name, baseServings, prepTime, preparation, tags, ingredients } = body;

    if (!userId) {
      return NextResponse.json({ error: 'Faltan campos obligatorios' }, { status: 400 });
    }

    const c = getContainer();
    const current = (await c.listRecipes.execute(userId)).find((r) => r.id === id);
    if (!current) {
      return NextResponse.json({ error: 'Receta no encontrada' }, { status: 404 });
    }

    const newTags: { id: string; dimension: TagDimension }[] = tags ?? [];
    const newIngredients: { ingredientId: string; quantityNote: string | null }[] = ingredients ?? [];

    const currentTagIds = current.tags.map((t) => t.id);
    const newTagIds = newTags.map((t) => t.id);

    const tagsToRemove = currentTagIds.filter((tid) => !newTagIds.includes(tid));
    const tagsToAdd = newTags.filter((nt) => !currentTagIds.includes(nt.id));

    const ingredientsToRemove = current.ingredients
      .filter((ci) => {
        const matched = newIngredients.find((ni) => ni.ingredientId === ci.ingredientId);
        return !matched || matched.quantityNote !== ci.quantityNote;
      })
      .map((i) => i.ingredientId);

    const ingredientsToAdd = newIngredients.filter((ni) => {
      const matched = current.ingredients.find((ci) => ci.ingredientId === ni.ingredientId);
      return !matched || matched.quantityNote !== ni.quantityNote;
    });

    await c.updateRecipe.execute({
      id,
      name,
      baseServings,
      prepTime,
      preparation: preparation ?? null,
      addTags: tagsToAdd,
      removeTags: tagsToRemove,
      addIngredients: ingredientsToAdd,
      removeIngredients: ingredientsToRemove,
    });

    const response = NextResponse.json({ ok: true });
    response.cookies.set('toast_queue', JSON.stringify([{ message: 'Receta actualizada correctamente.', type: 'success' }]), {
      path: '/dashboard',
      maxAge: 10,
    });

    return response;
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Error al actualizar la receta';
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}
