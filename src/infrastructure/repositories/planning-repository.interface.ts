import { Planning } from "@/domain/planning/aggregates/planning.aggregate"

export interface PlanningRepository {
  findById(Id: string): Planning | null;
  findAll(): Planning[];
  save(planning: Planning | null): void;
}