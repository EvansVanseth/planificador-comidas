export type IngredientNameFlat = {
  id: string;
  name: string;
};

export interface IngredientFlatReadRepository {
  findNamesByIds(ids: string[]): Promise<IngredientNameFlat[]>;
}
