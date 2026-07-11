import { UserRepository } from "@/domain/users/repositories/user-repository.interface";
import { User } from "@/domain/users/aggregates/user.aggregate";

export class InMemoryUserRepository implements UserRepository {
  private users: Map<string, User> = new Map();

  findById(id: string): User | null {
    return this.users.get(id) || null;
  }

  findAll(): User[] {
    return Array.from(this.users.values());
  }

  findByName(name: string): User | null {
    const normalized = name.toLowerCase().trim();
    return this.findAll().find(
      u => u.getName().toLowerCase().trim() === normalized
    ) ?? null;
  }

  findByEmail(email: string): User | null {
    const normalized = email.toLowerCase().trim();
    return this.findAll().find(
      u => u.getEmail().toLowerCase().trim() === normalized
    ) ?? null;
  }

  save(user: User): void {
    this.users.set(user.getId(), user);
  }

  delete(id: string): void {
    this.users.delete(id);
  }
}
