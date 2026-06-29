import { describe, it, expect } from 'vitest';
import { DayOrder } from './day-order.vo'
import { MinRangeError } from '@/domain/shared/errors/ranges-error';
import { NoIntegerError } from '@/domain/shared/errors/null-type-error';

describe('DayOrder (Value Object)', () => {
	it(`debe lanzar MinRangeError si es menor de ${DayOrder.MIN_VALUE}`, () => {
		expect(() => DayOrder.create(0)).toThrow(MinRangeError);
		expect(() => DayOrder.create(-10)).toThrow(MinRangeError);
	})
	it('debe lanzar NoIntegerError si no es un entero', () => {
		expect(() => DayOrder.create(1.5)).toThrow(NoIntegerError);
	})
	it('debe crear un valor valido de 5 minutos', () => {
		const time = DayOrder.create(5);
		expect(time.value).toBe(5);
	})
})