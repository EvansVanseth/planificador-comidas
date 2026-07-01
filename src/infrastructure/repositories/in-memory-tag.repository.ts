import { TagRepository } from "@/infrastructure/repositories/tag-repository.interface";
import { Tag } from "@/domain/tags/aggregates/tag.aggregate";

export class InMemoryTagRepository implements TagRepository {
  private tags: Map<string, Tag> = new Map();

  findById(id: string): Tag | null {
    return this.tags.get(id) || null;
  }

  findAll(): Tag[] {
    return Array.from(this.tags.values());
  }

  save(tag: Tag): void {
    this.tags.set(tag.getId(), tag);
  }

  delete(id: string): void {
    this.tags.delete(id);
  }
}
