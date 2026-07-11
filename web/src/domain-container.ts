import path from 'path';
import { createContainer, IContainer } from '@/infrastructure/container';

let _container: IContainer | null = null;

export function getContainer(): IContainer {
  if (!_container) {
    const originalCwd = process.cwd();
    const projectRoot = path.resolve(originalCwd, '..');
    process.chdir(projectRoot);
    _container = createContainer('file');
    process.chdir(originalCwd);
  }
  return _container;
}
