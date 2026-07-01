import * as fs from 'fs';
import * as path from 'path';
import { TagRepository } from './tag-repository.interface';
import { Tag } from '@/domain/tags/aggregates/tag.aggregate';
import { TagDimension } from '@/domain/recipes/value-objects/tag-dimension.enum';
import { TagPrimitives } from '@/domain/tags/aggregates/tag.aggregate';

export class FileTagRepository implements TagRepository {
  private readonly filePath: string;

  constructor(fileName: string = 'tags-db.json') {
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

  findAll(): Tag[] {
    const fileContent = fs.readFileSync(this.filePath, 'utf-8');
    const rawData: TagPrimitives[] = JSON.parse(fileContent);
    return rawData.map(data => Tag.fromPrimitives(data));
  }

  findAllByUserId(userId: string): Tag[] {
    return this.findAll().filter(t => t.getUserId() === userId);
  }

  findById(id: string): Tag | null {
    const tags = this.findAll();
    return tags.find(t => t.getId() === id) || null;
  }

  findByNameAndDimension(name: string, dimension: TagDimension): Tag | null {
    const normalized = name.toLowerCase().trim();
    return this.findAll().find(
      t => t.getName().toLowerCase().trim() === normalized && t.getDimension() === dimension
    ) ?? null;
  }

  save(tag: Tag): void {
    const tags = this.findAll();

    const index = tags.findIndex(t => t.getId() === tag.getId());

    if (index >= 0) {
      tags[index] = tag;
    } else {
      tags.push(tag);
    }

    const rawData = tags.map(t => t.toPrimitives());
    fs.writeFileSync(this.filePath, JSON.stringify(rawData, null, 2), 'utf-8');
  }

  delete(id: string): void {
    const tags = this.findAll();
    const index = tags.findIndex(t => t.getId() === id);
    if (index === -1) return;

    tags.splice(index, 1);
    const rawData = tags.map(t => t.toPrimitives());
    fs.writeFileSync(this.filePath, JSON.stringify(rawData, null, 2), 'utf-8');
  }
}
