import { getUserId } from '@/lib/auth';
import { getContainer } from '@/domain-container';
import RecipeForm from '../recipe-form';

export default async function NewRecipePage({
  searchParams,
}: {
  searchParams: { returnTo?: string };
}) {
  const userId = await getUserId();

  const c = getContainer();
  const allTags = await c.listTags.execute(userId);
  const allIngredients = await c.listIngredients.execute(userId);

  return (
    <RecipeForm
      userId={userId}
      allTags={allTags}
      allIngredients={allIngredients}
      returnTo={searchParams.returnTo}
    />
  );
}
