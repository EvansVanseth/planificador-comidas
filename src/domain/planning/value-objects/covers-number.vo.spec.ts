import { describe, it, expect } from 'vitest';
import { CoversNumber } from './covers-number.vo'
import { MinRangeError } from '@/domain/shared/errors/ranges-error';
import { NoIntegerError } from '@/domain/shared/errors/null-type-error';

describe('CoversNumber (Value Object)', () => {
	it(`debe lanzar MinRangeError si es menor de ${CoversNumber.MIN_VALUE}`, () => {
		expect(() => CoversNumber.create(-1)).toThrow(MinRangeError);
		expect(() => CoversNumber.create(-10)).toThrow(MinRangeError);
	})
	it('debe lanzar NoIntegerError si no es un entero', () => {
		expect(() => CoversNumber.create(1.5)).toThrow(NoIntegerError);
	})
	it('debe crear un valor valido de 5 minutos', () => {
		const time = CoversNumber.create(5);
		expect(time.value).toBe(5);
	})
})