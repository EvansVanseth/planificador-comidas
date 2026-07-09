import { PlanningRepository } from "@/domain/planning/repositories/planning-repository.interface";
import { Planning } from "@/domain/planning/aggregates/planning.aggregate";

export class InMemoryPlanningRepository implements PlanningRepository {
  private plannings: Map<string, Planning> = new Map();

  findById(id: string):Planning | null {
    return this.plannings.get(id) || null;
  }

  findAll(): Planning[] {
    return Array.from(this.plannings.values());
  }

  findAllByUserId(userId: string): Planning[] {
    return this.findAll().filter(p => p.getUserId() === userId);
  }

  findByName(name: string): Planning | null {
    const normalized = name.toLowerCase().trim();
    return this.findAll().find(p => p.getName().toLowerCase().trim() === normalized) ?? null;
  }

  save(planning: Planning): void {
    this.plannings.set(planning.getId(), planning);
  }

  delete(id: string): void {
    this.plannings.delete(id);
  }
}