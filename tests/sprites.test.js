const { getSpriteUrl, getSpriteInfo } = require('../src/sprites.js');

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
  });
});

describe('getSpriteInfo — dino gifs', () => {
  test('returns type gif for dino', () => {
    expect(getSpriteInfo('dino', 'walk-right', base).type).toBe('gif');
  });

  test('returns type gif for dog', () => {
    expect(getSpriteInfo('dog', 'walk-right', base).type).toBe('gif');
  });

  test('dino walk-right uses walk gif unflipped', () => {
    const info = getSpriteInfo('dino', 'walk-right', base);
    expect(info.url).toContain('dino-walk-v1.gif');
    expect(info.flip).toBe(false);
  });

  test('dino walk-left uses walk gif flipped', () => {
    const info = getSpriteInfo('dino', 'walk-left', base);
    expect(info.url).toContain('dino-walk-v1.gif');
    expect(info.flip).toBe(true);
  });

  test('dino sleeping uses sleep gif unflipped', () => {
    const info = getSpriteInfo('dino', 'sleeping', base);
    expect(info.url).toContain('dino-sleep-v1.gif');
    expect(info.flip).toBe(false);
  });

  test('unknown state falls back to sleep gif', () => {
    const info = getSpriteInfo('dino', 'unknown', base);
    expect(info.url).toContain('dino-sleep-v1.gif');
  });
});
