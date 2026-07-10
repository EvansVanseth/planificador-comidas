import path from 'path';
import { createContainer } from '@/infrastructure/container';

const projectRoot = path.resolve(process.cwd(), '..');
process.chdir(projectRoot);

const _container = createContainer('file');

export function getContainer() {
  return _container;
}
