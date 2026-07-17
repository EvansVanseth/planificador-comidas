import * as fs from 'fs';
import * as path from 'path';
import { TagRepository } from '@/domain/tags/repositories/tag-repository.interface';
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

  async findAll(): Promise<Tag[]> {
    const fileContent = fs.readFileSync(this.filePath, 'utf-8');
    const rawData: TagPrimitives[] = JSON.parse(fileContent);
    return rawData.map(data => Tag.fromPrimitives(data));
  }

  async findAllByUserId(userId: string): Promise<Tag[]> {
    const tags = await this.findAll();
    return tags.filter(t => t.getUserId() === userId);
  }

  async findById(id: string): Promise<Tag | null> {
    const tags = await this.findAll();
    return tags.find(t => t.getId() === id) || null;
  }

  async findByNameAndDimension(name: string, dimension: TagDimension): Promise<Tag | null> {
    const tags = await this.findAll();
    const normalized = name.toLowerCase().trim();
    return tags.find(
      t => t.getName().toLowerCase().trim() === normalized && t.getDimension() === dimension
    ) ?? null;
  }

  async save(tag: Tag): Promise<void> {
    const tags = await this.findAll();

    const index = tags.findIndex(t => t.getId() === tag.getId());

    if (index >= 0) {
      tags[index] = tag;
    } else {
      tags.push(tag);
    }

    const rawData = tags.map(t => t.toPrimitives());
    fs.writeFileSync(this.filePath, JSON.stringify(rawData, null, 2), 'utf-8');
  }

  async delete(id: string): Promise<void> {
    const tags = await this.findAll();
    const index = tags.findIndex(t => t.getId() === id);
    if (index === -1) return;

    tags.splice(index, 1);
    const rawData = tags.map(t => t.toPrimitives());
    fs.writeFileSync(this.filePath, JSON.stringify(rawData, null, 2), 'utf-8');
  }
}
