import { User } from '@/domain/users/aggregates/user.aggregate'

export interface UserRepository {
  findById(id: string): User | null;
  findAll(): User[];
  findByName(name: string): User | null;
  save(user: User): void;
  delete(id: string): void;
}
