import { describe, it, expect } from 'vitest'
import { PlannedWeeks } from './planned-weeks.vo'
import { OutRangeError } from '@/domain/shared/errors/ranges-error';

describe ('PlannedWeeks (Value Object)', () => {
  it(`debe estar en el rango (ambos incluidos) [${PlannedWeeks.MIN_VALUE}, ${PlannedWeeks.MAX_VALUE}]`, () => {
    expect(() => PlannedWeeks.create(PlannedWeeks.MIN_VALUE-1)).toThrow(OutRangeError);
    expect(() => PlannedWeeks.create(PlannedWeeks.MAX_VALUE+1)).toThrow(OutRangeError);
  })
  it('debe ser un numero entre 1 y 12 ambos incluidos', () => {
    const semanas = PlannedWeeks.create(5);
    expect(semanas.value).toBe(5);
  })
})