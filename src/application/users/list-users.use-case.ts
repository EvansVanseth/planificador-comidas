import { UserRepository } from '../../domain/users/repositories/user-repository.interface';
import { UserPrimitives } from '@/domain/users/aggregates/user.aggregate';

export class ListUsersUseCase {
  constructor(private userRepository: UserRepository) {}

  execute(): UserPrimitives[] {
    return this.userRepository.findAll().map(u => u.toPrimitives());
  }
}
