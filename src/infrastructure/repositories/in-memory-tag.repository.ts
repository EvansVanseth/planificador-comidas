import { TagRepository } from "@/domain/tags/repositories/tag-repository.interface";
import { Tag } from "@/domain/tags/aggregates/tag.aggregate";
import { TagDimension } from "@/domain/recipes/value-objects/tag-dimension.enum";

export class InMemoryTagRepository implements TagRepository {
  private tags: Map<string, Tag> = new Map();

  async findById(id: string): Promise<Tag | null> {
    return this.tags.get(id) || null;
  }

  async findAll(): Promise<Tag[]> {
    return Array.from(this.tags.values());
  }

  async findAllByUserId(userId: string): Promise<Tag[]> {
    return (await this.findAll()).filter(t => t.getUserId() === userId);
  }

  async findByNameAndDimension(name: string, dimension: TagDimension): Promise<Tag | null> {
    const normalized = name.toLowerCase().trim();
    const tags = await this.findAll();
    return tags.find(
      t => t.getName().toLowerCase().trim() === normalized && t.getDimension() === dimension
    ) ?? null;
  }

  async save(tag: Tag): Promise<void> {
    this.tags.set(tag.getId(), tag);
  }

  async delete(id: string): Promise<void> {
    this.tags.delete(id);
  }
}
