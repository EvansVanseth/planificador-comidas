import { DomainError } from "@/domain/shared/errors/domain-error";
import { Id } from "@/domain/shared/value-objects/id.vo";
import { Name } from "@/domain/shared/value-objects/name.vo";
import { UserId } from "@/domain/users/value-objects/user-id.vo";
import { StartDate } from "../value-objects/start-date.vo";
import { PlannedWeeks } from "../value-objects/planned-weeks.vo";
import { PlannedDay, PlannedDayDTO, PlannedDayPrimitives, ServiceUpdateInput } from "../entities/planned-day.entity";
import { PlanningPantryItem, PlanningPantryItemPrimitives } from "../entities/planning-pantry-item.entity";
import { PlanningShoppingItem, PlanningShoppingItemPrimitives } from "../entities/planning-shopping-item.entity";

const DIAS_SEMANA = 7;
const PLANNING_NAME_NICK = "Planning name";

export type PlanningPrimitives = {
  id: string;
  userid: string;
  name: string;
  startdate: string | null;
  weeks: number;
  hotColdBalance?: number;
  days: PlannedDayPrimitives[];
  pantryItems: PlanningPantryItemPrimitives[];
  shoppingItems: PlanningShoppingItemPrimitives[];
};

export class Planning {
  private id: Id;
  private userId: UserId;
  private name: Name;
  private startDate: StartDate;
  private weeks: PlannedWeeks;
  private hotColdBalance: number;
  private days: Map<number, PlannedDay> = new Map();
  private pantryItems: Map<string, PlanningPantryItem> = new Map();
  private shoppingItems: Map<string, PlanningShoppingItem> = new Map();

  private constructor(id: Id, userId: UserId, name: Name, startDate: StartDate, weeks: PlannedWeeks, hotColdBalance: number) {
    this.id = id;
    this.userId = userId;
    this.name = name;
    this.startDate = startDate;
    this.weeks = weeks;
    this.hotColdBalance = hotColdBalance;
  }

  public static create(id: string, userId: string, name: string, startDate: Date | null, weeks: number, hotColdBalance?: number): Planning {
    return new Planning(
      Id.create(id),
      UserId.create(userId),
      Name.create(PLANNING_NAME_NICK, name),
      StartDate.create(startDate),
      PlannedWeeks.create(weeks),
      hcb(hotColdBalance),
    );
  }

  //Id
  public getId(): string {
    return this.id.value;
  }

  // UserId
  public getUserId(): string {
    return this.userId.value;
  }

  // Name
  public getName(): string {
    return this.name.value;
  }

  public rename(name: string): void {
    this.name = Name.create(PLANNING_NAME_NICK, name);
  }

  // StartDate
  public getStartDate(): Date | null {
    return this.startDate.value;
  }

  public reSchedule(startDate: Date | null): void {
    this.startDate = StartDate.create(startDate);
  }

  // Weeks
  public getWeeks(): number {
    return this.weeks.value;
  }

  public changeWeeks(weeks: number): void {
    const newPlannedWeeks = PlannedWeeks.create(weeks);
    const newCountWeekDays = newPlannedWeeks.value * DIAS_SEMANA;

    this.days.forEach((day) => {
      if (day.getOrdenDia() > newCountWeekDays) {
        throw new DomainError(`No se puede cambiar el número de semanas a ${weeks} porque hay días planificados fuera del rango de semanas planificadas [1-${newCountWeekDays}]. Se sugiere eliminar primero los días planificados más allá de las semanas deseadas antes de cambiar el número de semanas.`);
      }
    });
    this.weeks = PlannedWeeks.create(weeks);
  }

  // HotColdBalance
  public getHotColdBalance(): number {
    return this.hotColdBalance;
  }

  public changeHotColdBalance(balance: number): void {
    if (!Number.isInteger(balance) || balance < 0 || balance > 100) {
      throw new DomainError(`El balance frío/caliente debe ser un número entero entre 0 y 100 (recibido: ${balance})`);
    }
    this.hotColdBalance = balance;
  }

  // Days
  public addDay(id: string, ordenDia: number): void {
    const day = PlannedDay.create(id, ordenDia);
    if (this.days.has(day.getOrdenDia())) {
      throw new DomainError('Ya existe un día con ese orden');
    }

    if (day.getOrdenDia() > this.CountWeekDays()) {
      throw new DomainError(`El día usado como orden debe estar dentro del conjunto de semanas [1-${this.CountWeekDays()}]`)
    }

    this.days.set(day.getOrdenDia(), day);
  }

  public assignMealToDay(ordenDia: number, momentTagId: string, covers: number, recipeId?: string | null, exclusions?: string[], preferences?: string[], ignoreRestrictions = false): void {
    const day = this.days.get(ordenDia);
    if (!day) {
      throw new DomainError('No existe un día con ese orden');
    }

    const existing = day.getMeal(momentTagId);
    if (existing) {
      existing.changeCovers(covers);
      if (recipeId !== undefined) {
        if (recipeId === null) {
          existing.unassignRecipe();
        } else {
          existing.assignRecipe(recipeId);
        }
      }
      if (exclusions !== undefined) {
        existing.setExclusions(exclusions);
      }
      if (preferences !== undefined) {
        existing.setPreferences(preferences);
      }
      existing.setIgnoreRestrictions(ignoreRestrictions);
    } else {
      day.addMeal(momentTagId, covers, recipeId ?? undefined, exclusions, preferences, ignoreRestrictions);
    }
  }

  public removeMealFromDay(ordenDia: number, momentTagId: string): void {
    const day = this.days.get(ordenDia);
    if (!day) {
      throw new DomainError('No existe un día con ese orden');
    }
    day.removeMeal(momentTagId);
  }

  public addMissingServiceToAllDays(momentTagId: string, covers: number, exclusions?: string[], preferences?: string[]): number {
    let count = 0;
    for (const day of this.days.values()) {
      if (!day.getMeal(momentTagId)) {
        day.addMeal(momentTagId, covers, undefined, exclusions, preferences);
        count++;
      }
    }
    return count;
  }

  public removeDay(ordenDia: number): void {
    if (!this.days.has(ordenDia)) {
      throw new DomainError('No existe un día con ese orden');
    }
    this.days.delete(ordenDia);
  }

  public bulkUpdateServices(days: number[], updates: ServiceUpdateInput): void {
    for (const dayOrder of days) {
      const day = this.days.get(dayOrder);
      if (!day) {
        throw new DomainError(`No existe un dia con orden ${dayOrder}`);
      }
      day.updateAllServices(updates);
    }
  }

  public addDays(entries: { id: string; ordenDia: number }[]): void {
    for (const entry of entries) {
      if (this.days.has(entry.ordenDia)) {
        throw new DomainError(`Ya existe un día con orden ${entry.ordenDia}`);
      }
      if (entry.ordenDia > this.CountWeekDays()) {
        throw new DomainError(`El día ${entry.ordenDia} está fuera del rango [1-${this.CountWeekDays()}]`);
      }
    }
    for (const entry of entries) {
      this.days.set(entry.ordenDia, PlannedDay.create(entry.id, entry.ordenDia));
    }
  }

  public removeDays(orders: number[]): void {
    for (const order of orders) {
      if (!this.days.has(order)) {
        throw new DomainError(`No existe un día con orden ${order}`);
      }
    }
    for (const order of orders) {
      this.days.delete(order);
    }
  }

  public assignMealToDays(days: number[], momentTagId: string, covers: number, recipeId?: string, clearRecipe?: boolean): void {
    for (const dayOrder of days) {
      if (!this.days.has(dayOrder)) {
        throw new DomainError(`No existe un día con orden ${dayOrder}`);
      }
    }
    for (const dayOrder of days) {
      const day = this.days.get(dayOrder)!;
      const existing = day.getMeal(momentTagId);
      if (existing) {
        existing.changeCovers(covers);
        if (recipeId !== undefined) {
          existing.assignRecipe(recipeId);
        } else if (clearRecipe) {
          existing.unassignRecipe();
        }
      } else {
        day.addMeal(momentTagId, covers, recipeId);
      }
    }
  }

  public removeMealFromDays(days: number[], momentTagId: string): void {
    for (const dayOrder of days) {
      const day = this.days.get(dayOrder);
      if (!day) {
        throw new DomainError(`No existe un día con orden ${dayOrder}`);
      }
      if (!day.getMeal(momentTagId)) {
        throw new DomainError(`No hay un servicio asignado para el momento del día en el día ${dayOrder}`);
      }
    }
    for (const dayOrder of days) {
      this.days.get(dayOrder)!.removeMeal(momentTagId);
    }
  }

  getDays(): PlannedDay[] {
    return Array.from(this.days.values());
  }

  public removeTagFromServices(tagId: string): number {
    let count = 0;
    for (const day of this.days.values()) {
      count += day.removeTagFromServices(tagId);
    }
    return count;
  }

  public unassignRecipeFromAllServices(recipeId: string): number {
    let count = 0;
    for (const day of this.days.values()) {
      count += day.unassignRecipeFromAllServices(recipeId);
    }
    return count;
  }

  public clearAllRecipesFromAllServices(): number {
    let count = 0;
    for (const day of this.days.values()) {
      count += day.clearAllRecipes();
    }
    return count;
  }

  public removeServicesByMomentTag(momentTagId: string): number {
    let count = 0;
    for (const day of this.days.values()) {
      if (day.removeServiceIfExists(momentTagId)) {
        count++;
      }
    }
    return count;
  }

  getDay(ordenDia: number): PlannedDayDTO | null {
    const day = this.days.get(ordenDia);
    return day ? day.toDTO() : null;
  }

  // Pantry Items
  public addPantryItem(id: string, ingredientId: string): void {
    if (this.pantryItems.has(ingredientId)) {
      throw new DomainError('Ya existe un item de despensa para ese ingrediente');
    }
    this.pantryItems.set(ingredientId, PlanningPantryItem.create(id, ingredientId));
  }

  public removePantryItem(ingredientId: string): void {
    if (!this.pantryItems.has(ingredientId)) {
      throw new DomainError('No existe un item de despensa para ese ingrediente');
    }
    this.pantryItems.delete(ingredientId);
  }

  public markPantryItemAsAvailable(ingredientId: string): void {
    const item = this.pantryItems.get(ingredientId);
    if (!item) {
      throw new DomainError('No existe un item de despensa para ese ingrediente');
    }
    item.markAsAvailable();
  }

  public updatePantryItemCovers(ingredientId: string, covers: number): void {
    const item = this.pantryItems.get(ingredientId);
    if (!item) {
      throw new DomainError('No existe un item de despensa para ese ingrediente');
    }
    item.updateCovers(covers);
  }

  public getPantryItems(): PlanningPantryItem[] {
    return Array.from(this.pantryItems.values());
  }

  // Shopping Items
  public addShoppingItem(id: string, ingredientId: string): void {
    if (this.shoppingItems.has(ingredientId)) {
      throw new DomainError('Ya existe un item de compra para ese ingrediente');
    }
    this.shoppingItems.set(ingredientId, PlanningShoppingItem.create(id, ingredientId));
  }

  public removeShoppingItem(ingredientId: string): void {
    if (!this.shoppingItems.has(ingredientId)) {
      throw new DomainError('No existe un item de compra para ese ingrediente');
    }
    this.shoppingItems.delete(ingredientId);
  }

  public markShoppingItemAsCompleted(ingredientId: string): void {
    const item = this.shoppingItems.get(ingredientId);
    if (!item) {
      throw new DomainError('No existe un item de compra para ese ingrediente');
    }
    item.markAsCompleted();
  }

  public markShoppingItemAsPending(ingredientId: string): void {
    const item = this.shoppingItems.get(ingredientId);
    if (!item) {
      throw new DomainError('No existe un item de compra para ese ingrediente');
    }
    item.markAsPending();
  }

  public getShoppingItems(): PlanningShoppingItem[] {
    return Array.from(this.shoppingItems.values());
  }

  public CountWeekDays(): number {
    return this.weeks.value * DIAS_SEMANA;
  }

  // Primitivas
  public toPrimitives(): PlanningPrimitives {
    const serializedDays = Array.from(this.days.values()).map(day => day.toPrimitives());

    return {
      id: this.id.value,
      userid: this.userId.value,
      name: this.name.value,
      startdate: this.startDate.value ? this.startDate.value.toISOString() : null,
      weeks: this.weeks.value,
      hotColdBalance: this.hotColdBalance,
      days: serializedDays,
      pantryItems: Array.from(this.pantryItems.values()).map(item => item.toPrimitives()),
      shoppingItems: Array.from(this.shoppingItems.values()).map(item => item.toPrimitives()),
    };
  }

  public static fromPrimitives(data: PlanningPrimitives): Planning {

    const parsedDate = data.startdate ? new Date(data.startdate) : null;

    const planning = new Planning(
      Id.create(data.id),
      UserId.create(data.userid),
      Name.create(PLANNING_NAME_NICK, data.name),
      StartDate.create(parsedDate),
      PlannedWeeks.create(data.weeks),
      hcb(data.hotColdBalance),
    );

    if (data.days && Array.isArray(data.days)) {
      data.days.forEach((dayData: any) => {
        const day = PlannedDay.fromPrimitives(dayData);
        planning.days.set(day.getOrdenDia(), day);
      });
    }

    if (data.pantryItems && Array.isArray(data.pantryItems)) {
      data.pantryItems.forEach((itemData: PlanningPantryItemPrimitives) => {
        const item = PlanningPantryItem.fromPrimitives(itemData);
        planning.pantryItems.set(item.getIngredientId(), item);
      });
    }

    if (data.shoppingItems && Array.isArray(data.shoppingItems)) {
      data.shoppingItems.forEach((itemData: PlanningShoppingItemPrimitives) => {
        const item = PlanningShoppingItem.fromPrimitives(itemData);
        planning.shoppingItems.set(item.getIngredientId(), item);
      });
    }

    return planning;
  }


}

function hcb(value: unknown): number {
  if (value == null) return 50;
  const n = Number(value);
  if (!Number.isInteger(n) || n < 0 || n > 100) return 50;
  return n;
}
