import { describe, it, expect } from 'vitest'
import { StartDate } from './start-date.vo'
import { DomainError } from '@/domain/shared/errors/domain-error';

describe('StartDate (Value Object)', () => {
  
  it('puede ser nulo', () => {
    const fecha = StartDate.create(null);
    expect(fecha.value).toBe(null);
  })
  
  it('puede ser un lunes', () => {
    const fecha = StartDate.create(new Date(2026, 5, 22));
    expect(fecha.value?.getDay()).toBe(1);
  })

  it('debe ser un lunes', () => {
    expect(() => StartDate.create(new Date(2026, 5, 23))).toThrow(DomainError);
  })  

})