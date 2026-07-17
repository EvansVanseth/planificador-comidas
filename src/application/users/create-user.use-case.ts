import { UserRepository } from '../../domain/users/repositories/user-repository.interface';
import { User } from '@/domain/users/aggregates/user.aggregate';
import { AppError } from '../shared/errors/app-error';
import { randomUUID } from 'crypto';

export class CreateUserUseCase {
  constructor(private userRepository: UserRepository) {}

  async execute(name: string, email?: string): Promise<string> {
    const userEmail = email ?? `${name.toLowerCase().replace(/\s+/g, '.')}@plancomidas.com`;
    const existingEmail = await this.userRepository.findByEmail(userEmail);
    if (existingEmail) {
      throw new AppError(`Ya existe un usuario con el email "${userEmail}"`);
    }

    const id = randomUUID();
    const user = User.create(id, name, userEmail);
    await this.userRepository.save(user);
    return id;
  }
}
