import { UserRepository } from '../../domain/users/repositories/user-repository.interface';
import { UserPrimitives } from '@/domain/users/aggregates/user.aggregate';

export class ListUsersUseCase {
  constructor(private userRepository: UserRepository) {}

  async execute(): Promise<UserPrimitives[]> {
    const users = await this.userRepository.findAll();
    return users.map(u => u.toPrimitives());
  }
}
