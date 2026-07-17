import * as fs from 'fs';
import * as path from 'path';
import { PlanningRepository } from "@/domain/planning/repositories/planning-repository.interface";
import { Planning } from "@/domain/planning/aggregates/planning.aggregate";

export class FilePlanningRepository implements PlanningRepository {
  private readonly filePath: string;

  constructor(fileName: string = 'plannings-db.json') {
    this.filePath = path.resolve(process.cwd(), 'file-persistence', fileName);
    this.initializeFile();
  }

  private initializeFile(): void {
    const dir = path.dirname(this.filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    if (!fs.existsSync(this.filePath)) {
      fs.writeFileSync(this.filePath, JSON.stringify([]), 'utf-8');
    }
  }

  async findAll(): Promise<Planning[]> {
    const fileContent = fs.readFileSync(this.filePath, 'utf-8');
    const rawData: any[] = JSON.parse(fileContent);
    return rawData.map(data => Planning.fromPrimitives(data));
  }

  async findAllByUserId(userId: string): Promise<Planning[]> {
    return (await this.findAll()).filter(p => p.getUserId() === userId);
  }

  async findByName(name: string): Promise<Planning | null> {
    const normalized = name.toLowerCase().trim();
    return (await this.findAll()).find(p => p.getName().toLowerCase().trim() === normalized) ?? null;
  }

  async findById(id: string): Promise<Planning | null> {
    const plannings = await this.findAll();
    return plannings.find(p => p.getId() === id) || null;
  }

  async save(planning: Planning): Promise<void> {
    const plannings = await this.findAll();
    
    const index = plannings.findIndex(p => p.getId() === planning.getId());
    
    if (index >= 0) {
      plannings[index] = planning;
    } else {
      plannings.push(planning);
    }

    const rawData = plannings.map(p => p.toPrimitives());
    
    fs.writeFileSync(this.filePath, JSON.stringify(rawData, null, 2), 'utf-8');
  }

  async delete(id: string): Promise<void> {
    const plannings = await this.findAll();
    const index = plannings.findIndex(p => p.getId() === id);
    if (index === -1) return;

    plannings.splice(index, 1);
    const rawData = plannings.map(p => p.toPrimitives());
    fs.writeFileSync(this.filePath, JSON.stringify(rawData, null, 2), 'utf-8');
  }
}