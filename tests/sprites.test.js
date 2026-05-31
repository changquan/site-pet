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

describe('getSpriteInfo — dino sheet', () => {
  test('returns type sheet for dino', () => {
    expect(getSpriteInfo('dino', 'walk-right', base).type).toBe('sheet');
  });

  test('returns type gif for dog', () => {
    expect(getSpriteInfo('dog', 'walk-right', base).type).toBe('gif');
  });

  test('dino walk-right has 6 frames unflipped', () => {
    const info = getSpriteInfo('dino', 'walk-right', base);
    expect(info.frames).toHaveLength(6);
    expect(info.flip).toBe(false);
  });

  test('dino walk-left has 6 frames flipped', () => {
    const info = getSpriteInfo('dino', 'walk-left', base);
    expect(info.frames).toHaveLength(6);
    expect(info.flip).toBe(true);
  });

  test('dino idle has 4 frames', () => {
    expect(getSpriteInfo('dino', 'idle', base).frames).toHaveLength(4);
  });

  test('dino sitting has 3 frames', () => {
    expect(getSpriteInfo('dino', 'sitting', base).frames).toHaveLength(3);
  });

  test('dino clicked has 4 frames from REACT row (y=768)', () => {
    const info = getSpriteInfo('dino', 'clicked', base);
    expect(info.frames).toHaveLength(4);
    expect(info.frames[0][1]).toBe(768); // y = row 4 * 192
  });

  test('dino sheet dimensions are correct', () => {
    const info = getSpriteInfo('dino', 'idle', base);
    expect(info.frameW).toBe(192);
    expect(info.frameH).toBe(192);
    expect(info.sheetW).toBe(1536);
    expect(info.sheetH).toBe(1024);
  });

  test('dino url points to dino2.png', () => {
    expect(getSpriteInfo('dino', 'idle', base).url).toContain('dino2.png');
  });

  test('unknown state falls back to idle frames', () => {
    const info = getSpriteInfo('dino', 'unknown', base);
    expect(info.frames).toHaveLength(4); // idle fallback
  });
});
