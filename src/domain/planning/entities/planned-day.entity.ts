import { Id } from "@/domain/shared/value-objects/id.vo";
import { DayOrder } from "../value-objects/day-order.vo";
import { MealTime } from './meal-time.enum'
import { MealService, MealServicePrimitives } from './meal-service.interface'
import { DomainError } from "@/domain/shared/errors/domain-error";
import { CoversNumber } from "../value-objects/covers-number.vo";

// Para devolver un DTO de PlannedDay, que es un objeto plano que se puede serializar fácilmente
export interface PlannedDayDTO {
  readonly id: string;
  readonly order: number;
  readonly services: Record<MealTime, MealService | null>;
}

export type PlannedDayPrimitives = {
  id: string;
  order: number;
  services: MealServicePrimitives[];
};

export class PlannedDay {
  private id: Id;
  private orden_dia: DayOrder;
  private services: Map<MealTime, MealService> = new Map();

  public constructor (id: Id, orden_dia: DayOrder) {
    this.orden_dia = orden_dia;
    this.id = id;
  }

  public static create(id: string, dia: number) {
    return new PlannedDay(Id.create(id), DayOrder.create(dia));
  }

  // Id
  public getId() : string {
    return this.id.value;
  }

  // OrdenDia
  public getOrdenDia() : number {
    return this.orden_dia.value;
  }  

  // Meals
  public addMeal(time: MealTime, recipeId: string, covers: number): void {
    if (this.services.has(time)) {
      throw new DomainError("Ya hay un servicio asignado a esta hora");
    }
    this.services.set(time, { recipeId: Id.create(recipeId), covers: CoversNumber.create(covers) });
  }
  public getMeal(time: MealTime): MealService | null {
    return this.services.get(time) ?? null;
  }

  // DTO
  public toDTO(): PlannedDayDTO {
    const servicesDTO: Record<MealTime, MealService | null> = {
      [MealTime.BREAKFAST]: this.services.get(MealTime.BREAKFAST) ?? null,
      [MealTime.LUNCH]: this.services.get(MealTime.LUNCH) ?? null,
      [MealTime.DINNER]: this.services.get(MealTime.DINNER) ?? null,
    };

    return {
      id: this.id.value,
      order: this.orden_dia.value,
      services: servicesDTO
    };
  }

  // Primitivas
  public toPrimitives(): PlannedDayPrimitives {

    const serializedServices: MealServicePrimitives[] = Array.from(this.services.entries()).map(([time, service]) => {
      return {
        time: time as string,
        recipeId: service.recipeId.value, 
        covers: service.covers.value      
      };
    });    

    return {
      id: this.id.value,
      order: this.orden_dia.value,
      services: serializedServices
    };
  }

  public static fromPrimitives(data: PlannedDayPrimitives): PlannedDay {
    const day = new PlannedDay(
      Id.create(data.id),
      DayOrder.create(data.order)
    );

    if (data.services && Array.isArray(data.services)) {
      data.services.forEach((svc: MealServicePrimitives) => {
        day.addMeal(svc.time as MealTime, svc.recipeId, svc.covers);
      });
    }

    return day;
  }


}