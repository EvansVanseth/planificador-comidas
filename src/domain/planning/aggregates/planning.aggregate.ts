import { DomainError } from "@/domain/shared/errors/domain-error";
import { Id } from "@/domain/shared/value-objects/id.vo";
import { Name } from "@/domain/shared/value-objects/name.vo";
import { UserId } from "@/domain/users/value-objects/user-id.vo";
import { StartDate } from "../value-objects/start-date.vo";
import { PlannedWeeks } from "../value-objects/planned-weeks.vo";
import { PlannedDay, PlannedDayDTO, PlannedDayPrimitives } from "../entities/planned-day.entity";
import { MealTime } from '../entities/meal-time.enum'

const DIAS_SEMANA = 7;
const PLANNING_NAME_NICK = "Planning name";

export type PlanningPrimitives = {
  id: string;
  userid: string;
  name: string;
  startdate: string | null;
  weeks: number;
  days: PlannedDayPrimitives[];
};

export class Planning {
  private id: Id;
  private userId: UserId;
  private name: Name;
  private startDate: StartDate;
  private weeks: PlannedWeeks;
  private days: Map<number, PlannedDay> = new Map();

  private constructor(id: Id, userId: UserId, name: Name, startDate: StartDate, weeks: PlannedWeeks) {
    this.id = id;
    this.userId = userId;
    this.name = name;
    this.startDate = startDate;
    this.weeks = weeks;
  }

  public CountWeekDays(): number {
    return this.weeks.value * DIAS_SEMANA;
  }

  public static create(id: string, userId: string, name: string, startDate: Date | null, weeks: number): Planning {
    return new Planning(
      Id.create(id),
      UserId.create(userId),
      Name.create(PLANNING_NAME_NICK, name),
      StartDate.create(startDate),
      PlannedWeeks.create(weeks)
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

  public assignMealToDay(ordenDia: number, time: MealTime, recipeId: string, covers: number): void {
    const day = this.days.get(ordenDia);
    if (!day) {
      throw new DomainError('No existe un día con ese orden');
    }

    day.addMeal(time, recipeId, covers);
  }

  public removeDay(ordenDia: number): void {
    if (!this.days.has(ordenDia)) {
      throw new DomainError('No existe un día con ese orden');
    }
    this.days.delete(ordenDia);
  }

  getDays(): PlannedDay[] {
    return Array.from(this.days.values());
  }

  getDay(ordenDia: number): PlannedDayDTO | null {
    const day = this.days.get(ordenDia);
    return day ? day.toDTO() : null;
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
      days: serializedDays
    };
  }

  public static fromPrimitives(data: PlanningPrimitives): Planning {

    const parsedDate = data.startdate ? new Date(data.startdate) : null;

    const planning = new Planning(
      Id.create(data.id),
      UserId.create(data.userid),
      Name.create(PLANNING_NAME_NICK, data.name),
      StartDate.create(parsedDate),
      PlannedWeeks.create(data.weeks)
    );

    if (data.days && Array.isArray(data.days)) {
      data.days.forEach((dayData: any) => {
        const day = PlannedDay.fromPrimitives(dayData);
        planning.days.set(day.getOrdenDia(), day);
      });
    }

    return planning;
  }


}