import path from 'path';
import { createContainer, IContainer } from '@/infrastructure/container';

let _container: IContainer | null = null;

export function getContainer(): IContainer {
  if (!_container) {
    const originalCwd = process.cwd();
    const projectRoot = path.resolve(originalCwd, '..');
    process.chdir(projectRoot);
    const mode = (process.env.STORAGE_BACKEND ?? 'postgres') as 'memory' | 'file' | 'postgres';
    _container = createContainer(mode);
    process.chdir(originalCwd);
  }
  return _container;
}
