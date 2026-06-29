import { describe, it, expect } from 'vitest'
import { MealTime } from './meal-time.enum'

describe('MealTime (Enum)', () => {
  it('debe tener los 3 valores definidos', () => {
    expect(Object.keys(MealTime)).toHaveLength(3);
  });

  it.each([
    ['BREAKFAST', MealTime.BREAKFAST],
    ['LUNCH', MealTime.LUNCH],
    ['DINNER', MealTime.DINNER],
  ])('debe existir %s', (_, value) => {
    expect(value).toBeDefined();
  });

  it('debe rechazar un valor que no pertenezca al enum en tiempo de compilación', () => {
    const invalid = 'SNACK' as MealTime;
    expect(Object.values(MealTime)).not.toContain(invalid);
  });
});
