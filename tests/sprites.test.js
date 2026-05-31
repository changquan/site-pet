const { getSpriteUrl } = require('../src/sprites.js');

const base = 'https://example.com/';

describe('getSpriteUrl', () => {
  test('walk-right returns walk.gif unflipped', () => {
    const { url, flip } = getSpriteUrl('cat', 'walk-right', base);
    expect(url).toBe('https://example.com/sprites/cat/walk.gif');
    expect(flip).toBe(false);
  });

  test('walk-left returns walk.gif flipped', () => {
    const { url, flip } = getSpriteUrl('cat', 'walk-left', base);
    expect(url).toBe('https://example.com/sprites/cat/walk.gif');
    expect(flip).toBe(true);
  });

  test('idle returns idle.gif unflipped', () => {
    const { url, flip } = getSpriteUrl('dog', 'idle', base);
    expect(url).toBe('https://example.com/sprites/dog/idle.gif');
    expect(flip).toBe(false);
  });

  test('sitting returns sit.gif unflipped', () => {
    const { url, flip } = getSpriteUrl('dino', 'sitting', base);
    expect(url).toBe('https://example.com/sprites/dino/sit.gif');
    expect(flip).toBe(false);
  });

  test('follow-cursor returns walk.gif unflipped (flip determined at runtime)', () => {
    const { url, flip } = getSpriteUrl('cat', 'follow-cursor', base);
    expect(url).toBe('https://example.com/sprites/cat/walk.gif');
    expect(flip).toBe(false);
  });

  test('clicked returns click.gif unflipped', () => {
    const { url, flip } = getSpriteUrl('cat', 'clicked', base);
    expect(url).toBe('https://example.com/sprites/cat/click.gif');
    expect(flip).toBe(false);
  });

  test('unknown state falls back to idle.gif', () => {
    const { url } = getSpriteUrl('cat', 'unknown', base);
    expect(url).toBe('https://example.com/sprites/cat/idle.gif');
  });

  test('uses correct pet subdirectory', () => {
    expect(getSpriteUrl('dog', 'idle', base).url).toContain('/sprites/dog/');
    expect(getSpriteUrl('dino', 'idle', base).url).toContain('/sprites/dino/');
  });
});
