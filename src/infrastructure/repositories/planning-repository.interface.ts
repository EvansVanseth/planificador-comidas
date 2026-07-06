import { Planning } from "@/domain/planning/aggregates/planning.aggregate"

export interface PlanningRepository {
  findById(Id: string): Planning | null;
  findAll(): Planning[];
  findAllByUserId(userId: string): Planning[];
  findByName(name: string): Planning | null;
  save(planning: Planning | null): void;
  delete(id: string): void;
}