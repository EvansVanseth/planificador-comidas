-- Enable RLS on all tables
ALTER TABLE "User" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Ingredient" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Tag" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Recipe" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "RecipeIngredient" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "RecipeTag" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Planning" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "PlannedDay" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "MealService" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "PlanningPantryItem" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "PlanningShoppingItem" ENABLE ROW LEVEL SECURITY;

-- User: own record only
CREATE POLICY "user_select" ON "User" FOR SELECT USING (id = auth.uid()::text);
CREATE POLICY "user_insert" ON "User" FOR INSERT WITH CHECK (id = auth.uid()::text);
CREATE POLICY "user_update" ON "User" FOR UPDATE USING (id = auth.uid()::text);
CREATE POLICY "user_delete" ON "User" FOR DELETE USING (id = auth.uid()::text);

-- Ingredient: user-scoped
CREATE POLICY "ingredient_select" ON "Ingredient" FOR SELECT USING ("userId" = auth.uid()::text);
CREATE POLICY "ingredient_insert" ON "Ingredient" FOR INSERT WITH CHECK ("userId" = auth.uid()::text);
CREATE POLICY "ingredient_update" ON "Ingredient" FOR UPDATE USING ("userId" = auth.uid()::text);
CREATE POLICY "ingredient_delete" ON "Ingredient" FOR DELETE USING ("userId" = auth.uid()::text);

-- Tag: user-scoped
CREATE POLICY "tag_select" ON "Tag" FOR SELECT USING ("userId" = auth.uid()::text);
CREATE POLICY "tag_insert" ON "Tag" FOR INSERT WITH CHECK ("userId" = auth.uid()::text);
CREATE POLICY "tag_update" ON "Tag" FOR UPDATE USING ("userId" = auth.uid()::text);
CREATE POLICY "tag_delete" ON "Tag" FOR DELETE USING ("userId" = auth.uid()::text);

-- Recipe: user-scoped
CREATE POLICY "recipe_select" ON "Recipe" FOR SELECT USING ("userId" = auth.uid()::text);
CREATE POLICY "recipe_insert" ON "Recipe" FOR INSERT WITH CHECK ("userId" = auth.uid()::text);
CREATE POLICY "recipe_update" ON "Recipe" FOR UPDATE USING ("userId" = auth.uid()::text);
CREATE POLICY "recipe_delete" ON "Recipe" FOR DELETE USING ("userId" = auth.uid()::text);

-- RecipeIngredient: scoped through recipe
CREATE POLICY "ri_select" ON "RecipeIngredient" FOR SELECT USING (
  EXISTS (SELECT 1 FROM "Recipe" WHERE id = "RecipeIngredient"."recipeId" AND "userId" = auth.uid()::text)
);
CREATE POLICY "ri_insert" ON "RecipeIngredient" FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM "Recipe" WHERE id = "RecipeIngredient"."recipeId" AND "userId" = auth.uid()::text)
);
CREATE POLICY "ri_update" ON "RecipeIngredient" FOR UPDATE USING (
  EXISTS (SELECT 1 FROM "Recipe" WHERE id = "RecipeIngredient"."recipeId" AND "userId" = auth.uid()::text)
);
CREATE POLICY "ri_delete" ON "RecipeIngredient" FOR DELETE USING (
  EXISTS (SELECT 1 FROM "Recipe" WHERE id = "RecipeIngredient"."recipeId" AND "userId" = auth.uid()::text)
);

-- RecipeTag: scoped through recipe
CREATE POLICY "rt_select" ON "RecipeTag" FOR SELECT USING (
  EXISTS (SELECT 1 FROM "Recipe" WHERE id = "RecipeTag"."recipeId" AND "userId" = auth.uid()::text)
);
CREATE POLICY "rt_insert" ON "RecipeTag" FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM "Recipe" WHERE id = "RecipeTag"."recipeId" AND "userId" = auth.uid()::text)
);
CREATE POLICY "rt_update" ON "RecipeTag" FOR UPDATE USING (
  EXISTS (SELECT 1 FROM "Recipe" WHERE id = "RecipeTag"."recipeId" AND "userId" = auth.uid()::text)
);
CREATE POLICY "rt_delete" ON "RecipeTag" FOR DELETE USING (
  EXISTS (SELECT 1 FROM "Recipe" WHERE id = "RecipeTag"."recipeId" AND "userId" = auth.uid()::text)
);

-- Planning: user-scoped (column is "userid")
CREATE POLICY "planning_select" ON "Planning" FOR SELECT USING ("userid" = auth.uid()::text);
CREATE POLICY "planning_insert" ON "Planning" FOR INSERT WITH CHECK ("userid" = auth.uid()::text);
CREATE POLICY "planning_update" ON "Planning" FOR UPDATE USING ("userid" = auth.uid()::text);
CREATE POLICY "planning_delete" ON "Planning" FOR DELETE USING ("userid" = auth.uid()::text);

-- PlannedDay: scoped through planning
CREATE POLICY "pd_select" ON "PlannedDay" FOR SELECT USING (
  EXISTS (SELECT 1 FROM "Planning" WHERE id = "PlannedDay"."planningId" AND "userid" = auth.uid()::text)
);
CREATE POLICY "pd_insert" ON "PlannedDay" FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM "Planning" WHERE id = "PlannedDay"."planningId" AND "userid" = auth.uid()::text)
);
CREATE POLICY "pd_update" ON "PlannedDay" FOR UPDATE USING (
  EXISTS (SELECT 1 FROM "Planning" WHERE id = "PlannedDay"."planningId" AND "userid" = auth.uid()::text)
);
CREATE POLICY "pd_delete" ON "PlannedDay" FOR DELETE USING (
  EXISTS (SELECT 1 FROM "Planning" WHERE id = "PlannedDay"."planningId" AND "userid" = auth.uid()::text)
);

-- MealService: scoped through planned day → planning
CREATE POLICY "ms_select" ON "MealService" FOR SELECT USING (
  EXISTS (SELECT 1 FROM "PlannedDay" JOIN "Planning" ON "Planning".id = "PlannedDay"."planningId"
          WHERE "PlannedDay".id = "MealService"."dayId" AND "Planning"."userid" = auth.uid()::text)
);
CREATE POLICY "ms_insert" ON "MealService" FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM "PlannedDay" JOIN "Planning" ON "Planning".id = "PlannedDay"."planningId"
          WHERE "PlannedDay".id = "MealService"."dayId" AND "Planning"."userid" = auth.uid()::text)
);
CREATE POLICY "ms_update" ON "MealService" FOR UPDATE USING (
  EXISTS (SELECT 1 FROM "PlannedDay" JOIN "Planning" ON "Planning".id = "PlannedDay"."planningId"
          WHERE "PlannedDay".id = "MealService"."dayId" AND "Planning"."userid" = auth.uid()::text)
);
CREATE POLICY "ms_delete" ON "MealService" FOR DELETE USING (
  EXISTS (SELECT 1 FROM "PlannedDay" JOIN "Planning" ON "Planning".id = "PlannedDay"."planningId"
          WHERE "PlannedDay".id = "MealService"."dayId" AND "Planning"."userid" = auth.uid()::text)
);

-- PlanningPantryItem: scoped through planning
CREATE POLICY "ppi_select" ON "PlanningPantryItem" FOR SELECT USING (
  EXISTS (SELECT 1 FROM "Planning" WHERE id = "PlanningPantryItem"."planningId" AND "userid" = auth.uid()::text)
);
CREATE POLICY "ppi_insert" ON "PlanningPantryItem" FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM "Planning" WHERE id = "PlanningPantryItem"."planningId" AND "userid" = auth.uid()::text)
);
CREATE POLICY "ppi_update" ON "PlanningPantryItem" FOR UPDATE USING (
  EXISTS (SELECT 1 FROM "Planning" WHERE id = "PlanningPantryItem"."planningId" AND "userid" = auth.uid()::text)
);
CREATE POLICY "ppi_delete" ON "PlanningPantryItem" FOR DELETE USING (
  EXISTS (SELECT 1 FROM "Planning" WHERE id = "PlanningPantryItem"."planningId" AND "userid" = auth.uid()::text)
);

-- PlanningShoppingItem: scoped through planning
CREATE POLICY "psi_select" ON "PlanningShoppingItem" FOR SELECT USING (
  EXISTS (SELECT 1 FROM "Planning" WHERE id = "PlanningShoppingItem"."planningId" AND "userid" = auth.uid()::text)
);
CREATE POLICY "psi_insert" ON "PlanningShoppingItem" FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM "Planning" WHERE id = "PlanningShoppingItem"."planningId" AND "userid" = auth.uid()::text)
);
CREATE POLICY "psi_update" ON "PlanningShoppingItem" FOR UPDATE USING (
  EXISTS (SELECT 1 FROM "Planning" WHERE id = "PlanningShoppingItem"."planningId" AND "userid" = auth.uid()::text)
);
CREATE POLICY "psi_delete" ON "PlanningShoppingItem" FOR DELETE USING (
  EXISTS (SELECT 1 FROM "Planning" WHERE id = "PlanningShoppingItem"."planningId" AND "userid" = auth.uid()::text)
);
