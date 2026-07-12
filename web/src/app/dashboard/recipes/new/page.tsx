import { cookies } from 'next/headers';
import { getContainer } from '@/domain-container';
import RecipeForm from '../recipe-form';

export default async function NewRecipePage() {
  const cookieStore = await cookies();
  const userId = cookieStore.get('userId')?.value ?? '';

  const c = getContainer();
  const allTags = c.listTags.execute(userId);
  const allIngredients = c.listIngredients.execute(userId);

  return (
    <RecipeForm
      userId={userId}
      allTags={allTags}
      allIngredients={allIngredients}
    />
  );
}
