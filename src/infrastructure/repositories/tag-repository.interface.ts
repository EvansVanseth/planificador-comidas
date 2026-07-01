import { Tag } from "@/domain/tags/aggregates/tag.aggregate"

export interface TagRepository {
  findById(id: string): Tag | null;
  findAll(): Tag[];
  save(tag: Tag): void;
  delete(id: string): void;
}
