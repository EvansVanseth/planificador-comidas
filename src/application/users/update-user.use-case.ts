import { UserRepository } from '../../domain/users/repositories/user-repository.interface';
import { AppError } from '../shared/errors/app-error';

export type UpdateUserInput = {
  id: string;
  name?: string;
};

export class UpdateUserUseCase {
  constructor(private userRepository: UserRepository) {}

  async execute(input: UpdateUserInput): Promise<void> {
    const user = await this.userRepository.findById(input.id);
    if (!user) {
      throw new AppError(`User not found: ${input.id}`);
    }

    if (input.name !== undefined) {
      const existing = await this.userRepository.findByName(input.name);
      if (existing && existing.getId() !== input.id) {
        throw new AppError(`Ya existe un usuario con el nombre "${input.name}"`);
      }
      user.rename(input.name);
    }

    await this.userRepository.save(user);
  }
}
