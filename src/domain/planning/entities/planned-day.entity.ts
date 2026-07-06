import { Id } from "@/domain/shared/value-objects/id.vo";
import { DayOrder } from "../value-objects/day-order.vo";
import { MealService, MealServicePrimitives } from './meal-service.entity'
import { DomainError } from "@/domain/shared/errors/domain-error";

export interface PlannedDayDTO {
  readonly id: string;
  readonly order: number;
  readonly services: Record<string, MealService | null>;
}

export type PlannedDayPrimitives = {
  id: string;
  order: number;
  services: MealServicePrimitives[];
};

export class PlannedDay {
  private id: Id;
  private orden_dia: DayOrder;
  private services: Map<string, MealService> = new Map();

  public constructor (id: Id, orden_dia: DayOrder) {
    this.orden_dia = orden_dia;
    this.id = id;
  }

  public static create(id: string, dia: number) {
    return new PlannedDay(Id.create(id), DayOrder.create(dia));
  }

  public getId() : string {
    return this.id.value;
  }

  public getOrdenDia() : number {
    return this.orden_dia.value;
  }  

  public addMeal(momentTagId: string, covers: number, recipeId?: string, exclusions?: string[], preferences?: string[]): void {
    if (this.services.has(momentTagId)) {
      throw new DomainError('Ya hay un servicio asignado para este momento del día');
    }
    this.services.set(momentTagId, MealService.create(covers, recipeId, exclusions, preferences));
  }

  public getMeal(momentTagId: string): MealService | null {
    return this.services.get(momentTagId) ?? null;
  }

  public removeMeal(momentTagId: string): void {
    if (!this.services.has(momentTagId)) {
      throw new DomainError('No hay un servicio asignado para este momento del día');
    }
    this.services.delete(momentTagId);
  }

  public toDTO(): PlannedDayDTO {
    const servicesDTO: Record<string, MealService | null> = {};
    for (const [tagId, service] of this.services.entries()) {
      servicesDTO[tagId] = service;
    }

    return {
      id: this.id.value,
      order: this.orden_dia.value,
      services: servicesDTO
    };
  }

  public toPrimitives(): PlannedDayPrimitives {
    const serializedServices: MealServicePrimitives[] = Array.from(this.services.entries()).map(([time, service]) => {
      return {
        ...service.toPrimitives(),
        time: time as string,
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
        const service = MealService.fromPrimitives(svc);
        day.services.set(svc.time, service);
      });
    }

    return day;
  }


}
