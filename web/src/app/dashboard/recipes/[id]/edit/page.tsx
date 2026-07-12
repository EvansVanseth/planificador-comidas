import { cookies } from 'next/headers';
import { getContainer } from '@/domain-container';
import RecipeForm from '../../recipe-form';
import { notFound } from 'next/navigation';

export default async function EditRecipePage({
  params,
  searchParams,
}: {
  params: { id: string };
  searchParams: { returnTo?: string };
}) {
  const cookieStore = await cookies();
  const userId = cookieStore.get('userId')?.value ?? '';
  if (!userId) notFound();

  const c = getContainer();
  const allTags = c.listTags.execute(userId);
  const allIngredients = c.listIngredients.execute(userId);
  const recipes = c.listRecipes.execute(userId);
  const recipe = recipes.find((r) => r.id === params.id);
  if (!recipe) notFound();

  return (
    <RecipeForm
      userId={userId}
      allTags={allTags}
      allIngredients={allIngredients}
      initialData={recipe}
      returnTo={searchParams.returnTo}
    />
  );
}
