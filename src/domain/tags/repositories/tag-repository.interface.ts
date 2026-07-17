import { Tag } from "@/domain/tags/aggregates/tag.aggregate"
import { TagDimension } from "@/domain/recipes/value-objects/tag-dimension.enum"

export interface TagRepository {
  findById(id: string): Promise<Tag | null>;
  findAll(): Promise<Tag[]>;
  findAllByUserId(userId: string): Promise<Tag[]>;
  findByNameAndDimension(name: string, dimension: TagDimension): Promise<Tag | null>;
  save(tag: Tag): Promise<void>;
  delete(id: string): Promise<void>;
}
