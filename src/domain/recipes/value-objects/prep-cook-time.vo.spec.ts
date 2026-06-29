import { describe, it, expect } from 'vitest';
import { PrepCookTime } from './prep-cook-time.vo'
import { MinRangeError } from '@/domain/shared/errors/ranges-error';
import { NoIntegerError } from '@/domain/shared/errors/null-type-error';

describe('PrepCookTime (Value Object)', () => {
	it(`debe lanzar MinRangeError si es menor de ${PrepCookTime.MIN_VALUE}`, () => {
		expect(() => PrepCookTime.create(0)).toThrow(MinRangeError);
		expect(() => PrepCookTime.create(-10)).toThrow(MinRangeError);
	})
	it('debe lanzar NoIntegerError si no es un entero', () => {
		expect(() => PrepCookTime.create(1.5)).toThrow(NoIntegerError);
	})
	it('debe crear un valor valido de 5 minutos', () => {
		const time = PrepCookTime.create(5);
		expect(time.value).toBe(5);
	})
})