import { describe, it, expect } from 'vitest';
import { UserId } from './user-id.vo';
import { DomainError } from '@/domain/shared/errors/domain-error';

describe('UserId (Value Object)', () => {
  const validId = '550e8400-e29b-41d4-a716-446655440000';

  it('debe crearse con un UUID válido', () => {
    const userId = UserId.create(validId);
    expect(userId.value).toBe(validId);
  });

  it('debe rechazar un UUID inválido', () => {
    expect(() => UserId.create('no-es-uuid')).toThrow(DomainError);
  });
});
