import { describe, it, expect } from 'vitest'
import { Id } from './id.vo';
import { DomainError } from '@/domain/shared/errors/domain-error';

describe('Id (Value Object)', () => {
  it('debe crear un ID válido con un UUID estándar', () => {
    const uuid = '550e8400-e29b-41d4-a716-446655440000';
    const id = Id.create(uuid);
    expect(id.value).toBe(uuid);
  });

  it('debe lanzar error si el formato no es un UUID válido', () => {
    expect(() => Id.create('no-es-un-uuid')).toThrow(DomainError);
  });
});