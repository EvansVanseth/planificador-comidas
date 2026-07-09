import { UserRepository } from '../../domain/users/repositories/user-repository.interface';
import { AppError } from '../shared/errors/app-error';

export class DeleteUserUseCase {
  constructor(private userRepository: UserRepository) {}

  execute(id: string): void {
    const user = this.userRepository.findById(id);
    if (!user) {
      throw new AppError(`User not found: ${id}`);
    }
    this.userRepository.delete(id);
  }
}
