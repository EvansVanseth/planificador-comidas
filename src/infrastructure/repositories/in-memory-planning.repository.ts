import { PlanningRepository } from "@/domain/planning/repositories/planning-repository.interface";
import { Planning } from "@/domain/planning/aggregates/planning.aggregate";

export class InMemoryPlanningRepository implements PlanningRepository {
  private plannings: Map<string, Planning> = new Map();

  async findById(id: string): Promise<Planning | null> {
    return this.plannings.get(id) || null;
  }

  async findAll(): Promise<Planning[]> {
    return Array.from(this.plannings.values());
  }

  async findAllByUserId(userId: string): Promise<Planning[]> {
    return (await this.findAll()).filter(p => p.getUserId() === userId);
  }

  async findByName(name: string): Promise<Planning | null> {
    const normalized = name.toLowerCase().trim();
    return (await this.findAll()).find(p => p.getName().toLowerCase().trim() === normalized) ?? null;
  }

  async save(planning: Planning): Promise<void> {
    this.plannings.set(planning.getId(), planning);
  }

  async delete(id: string): Promise<void> {
    this.plannings.delete(id);
  }
}