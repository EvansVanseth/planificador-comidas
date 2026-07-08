export function findSimilarIngredients(
  ingredients: { name: string }[],
  name: string,
): { name: string }[] {
  const normalized = name.toLowerCase().trim();
  return ingredients.filter(i => {
    const normalizedName = i.name.toLowerCase().trim();
    return normalizedName !== normalized && (
      normalizedName.includes(normalized) ||
      normalized.includes(normalizedName)
    );
  });
}
