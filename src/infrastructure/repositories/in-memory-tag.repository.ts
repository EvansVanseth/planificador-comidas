import { TagRepository } from "@/infrastructure/repositories/tag-repository.interface";
import { Tag } from "@/domain/tags/aggregates/tag.aggregate";
import { TagDimension } from "@/domain/recipes/value-objects/tag-dimension.enum";

export class InMemoryTagRepository implements TagRepository {
  private tags: Map<string, Tag> = new Map();

  findById(id: string): Tag | null {
    return this.tags.get(id) || null;
  }

  findAll(): Tag[] {
    return Array.from(this.tags.values());
  }

  findAllByUserId(userId: string): Tag[] {
    return this.findAll().filter(t => t.getUserId() === userId);
  }

  findByNameAndDimension(name: string, dimension: TagDimension): Tag | null {
    const normalized = name.toLowerCase().trim();
    return this.findAll().find(
      t => t.getName().toLowerCase().trim() === normalized && t.getDimension() === dimension
    ) ?? null;
  }

  save(tag: Tag): void {
    this.tags.set(tag.getId(), tag);
  }

  delete(id: string): void {
    this.tags.delete(id);
  }
}
