const { parseConfig } = require('../src/config.js');

describe('parseConfig', () => {
  test('returns defaults when called with undefined', () => {
    expect(parseConfig(undefined)).toEqual({ pet: 'dino', scale: 2, speed: 3, floor: 0 });
  });

  test('returns defaults when called with empty object', () => {
    expect(parseConfig({})).toEqual({ pet: 'dino', scale: 2, speed: 3, floor: 0 });
  });

  test('accepts valid pet type cat', () => {
    expect(parseConfig({ pet: 'cat' }).pet).toBe('cat');
  });

  test('accepts valid pet type dog', () => {
    expect(parseConfig({ pet: 'dog' }).pet).toBe('dog');
  });

  test('accepts valid pet type dino', () => {
    expect(parseConfig({ pet: 'dino' }).pet).toBe('dino');
  });

  test('falls back to dino for unknown pet type', () => {
    expect(parseConfig({ pet: 'hamster' }).pet).toBe('dino');
  });

  test('falls back to dino for numeric pet', () => {
    expect(parseConfig({ pet: 42 }).pet).toBe('dino');
  });

  test('accepts positive scale', () => {
    expect(parseConfig({ scale: 3 }).scale).toBe(3);
  });

  test('falls back to default scale for negative value', () => {
    expect(parseConfig({ scale: -1 }).scale).toBe(2);
  });

  test('falls back to default scale for string value', () => {
    expect(parseConfig({ scale: 'big' }).scale).toBe(2);
  });

  test('accepts positive speed', () => {
    expect(parseConfig({ speed: 5 }).speed).toBe(5);
  });

  test('falls back to default speed for zero', () => {
    expect(parseConfig({ speed: 0 }).speed).toBe(3);
  });

  test('accepts floor offset of zero', () => {
    expect(parseConfig({ floor: 0 }).floor).toBe(0);
  });

  test('accepts positive floor offset', () => {
    expect(parseConfig({ floor: 50 }).floor).toBe(50);
  });

  test('falls back to default floor for string value', () => {
    expect(parseConfig({ floor: 'bottom' }).floor).toBe(0);
  });
});
