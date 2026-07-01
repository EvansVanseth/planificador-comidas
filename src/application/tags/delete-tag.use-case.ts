import { TagRepository } from '../../infrastructure/repositories/tag-repository.interface';
import { AppError } from '../shared/errors/app-error';

export class DeleteTagUseCase {
  constructor(private tagRepository: TagRepository) {}

  execute(id: string): void {
    const tag = this.tagRepository.findById(id);
    if (!tag) {
      throw new AppError(`Tag not found: ${id}`);
    }

    this.tagRepository.delete(id);
  }
}
