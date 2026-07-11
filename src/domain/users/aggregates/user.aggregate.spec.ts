import { describe, it, expect } from 'vitest';
import { User } from './user.aggregate';
import { DomainError } from '@/domain/shared/errors/domain-error';
import { NullError } from '@/domain/shared/errors/null-type-error';

describe('User (Aggregate)', () => {
  const validId = '550e8400-e29b-41d4-a716-446655440000';
  const validEmail = 'albus@test.com';

  it('debe crearse correctamente con id, nombre y email', () => {
    const user = User.create(validId, 'Albus', validEmail);
    expect(user.getId()).toBe(validId);
    expect(user.getName()).toBe('Albus');
    expect(user.getEmail()).toBe(validEmail);
  });

  it('debe normalizar email a minúsculas al crear', () => {
    const user = User.create(validId, 'Albus', 'ALBUS@TEST.COM');
    expect(user.getEmail()).toBe('albus@test.com');
  });

  it('debe rechazar un id inválido al crear', () => {
    expect(() => User.create('id-invalido', 'Albus', validEmail)).toThrow(DomainError);
  });

  it('debe rechazar un nombre vacío', () => {
    expect(() => User.create(validId, '', validEmail)).toThrow(NullError);
  });

  it('debe rechazar un nombre demasiado corto', () => {
    expect(() => User.create(validId, 'Al', validEmail)).toThrow(DomainError);
  });

  it('debe rechazar email vacío', () => {
    expect(() => User.create(validId, 'Albus', '')).toThrow(DomainError);
  });

  it('debe rechazar email sin @', () => {
    expect(() => User.create(validId, 'Albus', 'sinarroba')).toThrow(DomainError);
  });

  it('debe permitir renombrar el usuario', () => {
    const user = User.create(validId, 'Albus', validEmail);
    user.rename('Albus Dumbledore');
    expect(user.getName()).toBe('Albus Dumbledore');
  });

  it('debe rechazar un rename con nombre vacío', () => {
    const user = User.create(validId, 'Albus', validEmail);
    expect(() => user.rename('')).toThrow(NullError);
  });

  it('debe permitir cambiar el email', () => {
    const user = User.create(validId, 'Albus', validEmail);
    user.changeEmail('nuevo@test.com');
    expect(user.getEmail()).toBe('nuevo@test.com');
  });

  it('debe rechazar changeEmail vacío', () => {
    const user = User.create(validId, 'Albus', validEmail);
    expect(() => user.changeEmail('')).toThrow(DomainError);
  });

  it('debe serializar y deserializar correctamente a primitivas', () => {
    const user = User.create(validId, 'Albus', validEmail);
    const primitives = user.toPrimitives();
    expect(primitives).toEqual({
      id: validId,
      name: 'Albus',
      email: validEmail,
    });

    const restored = User.fromPrimitives(primitives);
    expect(restored.getId()).toBe(validId);
    expect(restored.getName()).toBe('Albus');
    expect(restored.getEmail()).toBe(validEmail);
  });
});
