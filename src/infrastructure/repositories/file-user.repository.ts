import * as fs from 'fs';
import * as path from 'path';
import { UserRepository } from '@/domain/users/repositories/user-repository.interface';
import { User } from '@/domain/users/aggregates/user.aggregate';

export class FileUserRepository implements UserRepository {
  private readonly filePath: string;

  constructor(fileName: string = 'users-db.json') {
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

  findAll(): User[] {
    const fileContent = fs.readFileSync(this.filePath, 'utf-8');
    const rawData = JSON.parse(fileContent);
    return rawData.map((data: any) => User.fromPrimitives(data));
  }

  findById(id: string): User | null {
    const users = this.findAll();
    return users.find(u => u.getId() === id) || null;
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
    const users = this.findAll();
    const index = users.findIndex(u => u.getId() === user.getId());

    if (index >= 0) {
      users[index] = user;
    } else {
      users.push(user);
    }

    const rawData = users.map(u => u.toPrimitives());
    fs.writeFileSync(this.filePath, JSON.stringify(rawData, null, 2), 'utf-8');
  }

  delete(id: string): void {
    const users = this.findAll();
    const index = users.findIndex(u => u.getId() === id);
    if (index === -1) return;

    users.splice(index, 1);
    const rawData = users.map(u => u.toPrimitives());
    fs.writeFileSync(this.filePath, JSON.stringify(rawData, null, 2), 'utf-8');
  }
}
