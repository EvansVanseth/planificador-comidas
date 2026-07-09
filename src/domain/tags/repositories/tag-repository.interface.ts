import { Tag } from "@/domain/tags/aggregates/tag.aggregate"
import { TagDimension } from "@/domain/recipes/value-objects/tag-dimension.enum"

export interface TagRepository {
  findById(id: string): Tag | null;
  findAll(): Tag[];
  findAllByUserId(userId: string): Tag[];
  findByNameAndDimension(name: string, dimension: TagDimension): Tag | null;
  save(tag: Tag): void;
  delete(id: string): void;
}
