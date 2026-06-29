import { describe, it, expect } from 'vitest';
import { User } from './user.aggregate';
import { DomainError } from '@/domain/shared/errors/domain-error';
import { NullError } from '@/domain/shared/errors/null-type-error';

describe('User (Aggregate)', () => {
  const validId = '550e8400-e29b-41d4-a716-446655440000';

  it('debe crearse correctamente con id y nombre', () => {
    const user = User.create(validId, 'Albus');
    expect(user.getId()).toBe(validId);
    expect(user.getName()).toBe('Albus');
  });

  it('debe rechazar un id inválido al crear', () => {
    expect(() => User.create('id-invalido', 'Albus')).toThrow(DomainError);
  });

  it('debe rechazar un nombre vacío', () => {
    expect(() => User.create(validId, '')).toThrow(NullError);
  });

  it('debe rechazar un nombre demasiado corto', () => {
    expect(() => User.create(validId, 'Al')).toThrow(DomainError);
  });

  it('debe permitir renombrar el usuario', () => {
    const user = User.create(validId, 'Albus');
    user.rename('Albus Dumbledore');
    expect(user.getName()).toBe('Albus Dumbledore');
  });

  it('debe rechazar un rename con nombre vacío', () => {
    const user = User.create(validId, 'Albus');
    expect(() => user.rename('')).toThrow(NullError);
  });

  it('debe serializar y deserializar correctamente a primitivas', () => {
    const user = User.create(validId, 'Albus');
    const primitives = user.toPrimitives();
    expect(primitives).toEqual({
      id: validId,
      name: 'Albus'
    });

    const restored = User.fromPrimitives(primitives);
    expect(restored.getId()).toBe(validId);
    expect(restored.getName()).toBe('Albus');
  });
});
