const { createRenderer } = require('../src/renderer.js');

describe('createRenderer', () => {
  let renderer;

  afterEach(() => {
    if (renderer) renderer.remove();
    renderer = null;
  });

  test('injects a fixed-position div into document.body', () => {
    renderer = createRenderer({ floor: 0, scale: 2 });
    const el = renderer.getElement();
    expect(el).toBeTruthy();
    expect(el.style.position).toBe('fixed');
    expect(document.body.contains(el)).toBe(true);
  });

  test('positions div at specified floor from bottom', () => {
    renderer = createRenderer({ floor: 20, scale: 2 });
    expect(renderer.getElement().style.bottom).toBe('20px');
  });

  test('setPosition updates left style', () => {
    renderer = createRenderer({ floor: 0, scale: 2 });
    renderer.setPosition(150);
    expect(renderer.getElement().style.left).toBe('150px');
  });

  test('setSprite sets img src', () => {
    renderer = createRenderer({ floor: 0, scale: 2 });
    renderer.setSprite('cat/walk.gif', false, 2);
    const img = renderer.getElement().querySelector('img');
    expect(img.src).toContain('cat/walk.gif');
  });

  test('setSprite applies scaleX(-1) when flip is true', () => {
    renderer = createRenderer({ floor: 0, scale: 2 });
    renderer.setSprite('cat/walk.gif', true, 2);
    const img = renderer.getElement().querySelector('img');
    expect(img.style.transform).toContain('scaleX(-1)');
  });

  test('setSprite does not apply scaleX(-1) when flip is false', () => {
    renderer = createRenderer({ floor: 0, scale: 2 });
    renderer.setSprite('cat/walk.gif', false, 2);
    const img = renderer.getElement().querySelector('img');
    expect(img.style.transform).not.toContain('scaleX(-1)');
  });

  test('remove() removes element from DOM', () => {
    renderer = createRenderer({ floor: 0, scale: 2 });
    const el = renderer.getElement();
    renderer.remove();
    expect(document.body.contains(el)).toBe(false);
    renderer = null;
  });
});
