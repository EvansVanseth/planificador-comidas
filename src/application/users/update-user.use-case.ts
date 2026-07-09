import { UserRepository } from '../../domain/users/repositories/user-repository.interface';
import { AppError } from '../shared/errors/app-error';

export type UpdateUserInput = {
  id: string;
  name?: string;
};

export class UpdateUserUseCase {
  constructor(private userRepository: UserRepository) {}

  execute(input: UpdateUserInput): void {
    const user = this.userRepository.findById(input.id);
    if (!user) {
      throw new AppError(`User not found: ${input.id}`);
    }

    if (input.name !== undefined) {
      const existing = this.userRepository.findByName(input.name);
      if (existing && existing.getId() !== input.id) {
        throw new AppError(`Ya existe un usuario con el nombre "${input.name}"`);
      }
      user.rename(input.name);
    }

    this.userRepository.save(user);
  }
}
