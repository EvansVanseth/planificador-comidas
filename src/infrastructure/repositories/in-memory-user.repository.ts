import { UserRepository } from "@/domain/users/repositories/user-repository.interface";
import { User } from "@/domain/users/aggregates/user.aggregate";

export class InMemoryUserRepository implements UserRepository {
  private users: Map<string, User> = new Map();

  async findById(id: string): Promise<User | null> {
    return this.users.get(id) || null;
  }

  async findAll(): Promise<User[]> {
    return Array.from(this.users.values());
  }

  async findByName(name: string): Promise<User | null> {
    const normalized = name.toLowerCase().trim();
    const users = await this.findAll();
    return users.find(
      u => u.getName().toLowerCase().trim() === normalized
    ) ?? null;
  }

  async findByEmail(email: string): Promise<User | null> {
    const normalized = email.toLowerCase().trim();
    const users = await this.findAll();
    return users.find(
      u => u.getEmail().toLowerCase().trim() === normalized
    ) ?? null;
  }

  async save(user: User): Promise<void> {
    this.users.set(user.getId(), user);
  }

  async delete(id: string): Promise<void> {
    this.users.delete(id);
  }
}
