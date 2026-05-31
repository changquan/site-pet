const { isNear, cursorDirection } = require('../src/cursor.js');

function mockEl(left, top, width, height) {
  return { getBoundingClientRect: () => ({ left, top, width, height }) };
}

describe('isNear', () => {
  test('returns true when cursor is within threshold distance', () => {
    const el = mockEl(100, 500, 32, 32);
    // pet center: (116, 516), cursor at (150, 516) → distance ≈ 34px < 100
    expect(isNear(el, 150, 516, 100)).toBe(true);
  });

  test('returns false when cursor is beyond threshold distance', () => {
    const el = mockEl(100, 500, 32, 32);
    // pet center: (116, 516), cursor at (300, 516) → distance ≈ 184px > 100
    expect(isNear(el, 300, 516, 100)).toBe(false);
  });

  test('returns true when cursor is exactly on pet center', () => {
    const el = mockEl(100, 500, 32, 32);
    expect(isNear(el, 116, 516, 100)).toBe(true);
  });

  test('returns false at exactly the threshold distance', () => {
    const el = mockEl(100, 500, 32, 32);
    // pet center: (116, 516), cursor at (216, 516) → distance = 100px (not < 100)
    expect(isNear(el, 216, 516, 100)).toBe(false);
  });
});

describe('cursorDirection', () => {
  test('returns right when cursor is to the right of pet center', () => {
    const el = mockEl(100, 500, 32, 32); // center at x=116
    expect(cursorDirection(el, 200)).toBe('right');
  });

  test('returns left when cursor is to the left of pet center', () => {
    const el = mockEl(100, 500, 32, 32); // center at x=116
    expect(cursorDirection(el, 50)).toBe('left');
  });
});
