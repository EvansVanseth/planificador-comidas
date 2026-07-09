import { UserRepository } from '../../domain/users/repositories/user-repository.interface';
import { User } from '@/domain/users/aggregates/user.aggregate';
import { AppError } from '../shared/errors/app-error';
import { randomUUID } from 'crypto';

export class CreateUserUseCase {
  constructor(private userRepository: UserRepository) {}

  execute(name: string): string {
    const existing = this.userRepository.findByName(name);
    if (existing) {
      throw new AppError(`Ya existe un usuario con el nombre "${name}"`);
    }

    const id = randomUUID();
    const user = User.create(id, name);
    this.userRepository.save(user);
    return id;
  }
}
