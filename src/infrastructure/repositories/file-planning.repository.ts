import * as fs from 'fs';
import * as path from 'path';
import { PlanningRepository } from "@/infrastructure/repositories/planning-repository.interface";
import { Planning } from "@/domain/planning/aggregates/planning.aggregate";

export class FilePlanningRepository implements PlanningRepository {
  private readonly filePath: string;

  constructor(fileName: string = 'plannings-db.json') {
    this.filePath = path.resolve(process.cwd(), fileName);
    this.initializeFile();
  }

  private initializeFile(): void {
    if (!fs.existsSync(this.filePath)) {
      fs.writeFileSync(this.filePath, JSON.stringify([]), 'utf-8');
    }
  }

  findAll(): Planning[] {
    const fileContent = fs.readFileSync(this.filePath, 'utf-8');
    const rawData: any[] = JSON.parse(fileContent);
    return rawData.map(data => Planning.fromPrimitives(data));
  }

  findById(id: string): Planning | null {
    const plannings = this.findAll();
    return plannings.find(p => p.getId() === id) || null;
  }

  save(planning: Planning): void {
    const plannings = this.findAll();
    
    const index = plannings.findIndex(p => p.getId() === planning.getId());
    
    if (index >= 0) {
      plannings[index] = planning;
    } else {
      plannings.push(planning);
    }

    const rawData = plannings.map(p => p.toPrimitives());
    
    fs.writeFileSync(this.filePath, JSON.stringify(rawData, null, 2), 'utf-8');
  }

  delete(id: string): void {
    const plannings = this.findAll();
    const index = plannings.findIndex(p => p.getId() === id);
    if (index === -1) return;

    plannings.splice(index, 1);
    const rawData = plannings.map(p => p.toPrimitives());
    fs.writeFileSync(this.filePath, JSON.stringify(rawData, null, 2), 'utf-8');
  }
}