# Site Pet Widget Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build an embeddable JS widget (`site-pet.js`) that injects an animated pixel-art pet (dino, cat, or dog) into any website — walks, idles, sits, follows cursor, reacts to clicks.

**Architecture:** Source is split into focused ES modules under `src/` (config, state machine, sprite manifest, renderer, cursor). esbuild bundles them to a single IIFE `site-pet.js`. Jest + Babel tests the pure logic modules. Sprites are MIT-licensed GIF files sourced from VS Code Pets; the pet `<img>` swaps its `src` to change state, and CSS `scaleX(-1)` handles left-facing frames.

**Tech Stack:** Vanilla JS (ES modules → IIFE via esbuild), Jest 29 + jsdom, Babel, MIT-licensed GIF sprites (VS Code Pets repo).

---

## File Map

| File | Responsibility |
|---|---|
| `src/config.js` | Parse `window.SitePetConfig`, apply defaults, validate inputs |
| `src/sprites.js` | Map `(pet, state, base)` → `{ url, flip }` |
| `src/state-machine.js` | All state transitions — pure logic, no DOM |
| `src/cursor.js` | Proximity check, cursor-direction utility, event wiring |
| `src/renderer.js` | Inject `<div>` + `<img>`, expose `setPosition` / `setSprite` / `remove` |
| `src/index.js` | Entry point: read config, wire all modules, run RAF loop |
| `tests/config.test.js` | Config parser tests |
| `tests/sprites.test.js` | Sprite manifest tests |
| `tests/state-machine.test.js` | State machine transition tests |
| `tests/cursor.test.js` | Proximity + direction tests |
| `tests/renderer.test.js` | DOM injection tests (jsdom) |
| `build.js` | esbuild script → `site-pet.js` |
| `sprites/cat/` | `walk.gif`, `idle.gif`, `sit.gif`, `click.gif` |
| `sprites/dog/` | same |
| `sprites/dino/` | same |
| `demo/index.html` | Local test page |
| `site-pet.js` | Built output (committed for easy embedding) |

---

## Task 1: Project Setup

**Files:**
- Create: `package.json`
- Create: `.babelrc`
- Create: `jest.config.js`
- Create: `build.js`

- [ ] **Step 1: Create `package.json`**

```json
{
  "name": "site-pet",
  "version": "1.0.0",
  "description": "Embeddable animated pet widget for websites",
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch",
    "build": "node build.js"
  },
  "devDependencies": {
    "@babel/core": "^7.24.0",
    "@babel/preset-env": "^7.24.0",
    "babel-jest": "^29.7.0",
    "esbuild": "^0.20.0",
    "jest": "^29.7.0",
    "jest-environment-jsdom": "^29.7.0"
  }
}
```

- [ ] **Step 2: Create `.babelrc`**

```json
{
  "presets": [["@babel/preset-env", { "targets": { "node": "current" } }]]
}
```

- [ ] **Step 3: Create `jest.config.js`**

```js
module.exports = {
  testEnvironment: 'jsdom',
};
```

- [ ] **Step 4: Create `build.js`**

```js
const esbuild = require('esbuild');

esbuild.build({
  entryPoints: ['src/index.js'],
  bundle: true,
  format: 'iife',
  outfile: 'site-pet.js',
  minify: false,
}).catch(() => process.exit(1));
```

- [ ] **Step 5: Install dependencies**

```bash
npm install
```

Expected: `node_modules/` created, no errors.

- [ ] **Step 6: Write a smoke test to verify Jest works**

Create `tests/smoke.test.js`:

```js
test('Jest is configured correctly', () => {
  expect(1 + 1).toBe(2);
});
```

- [ ] **Step 7: Run tests**

```bash
npm test
```

Expected: `PASS tests/smoke.test.js`, 1 test passes.

- [ ] **Step 8: Commit**

```bash
mkdir -p src tests sprites/cat sprites/dog sprites/dino demo
git add package.json .babelrc jest.config.js build.js tests/smoke.test.js
git commit -m "chore: project setup — jest, babel, esbuild"
```

---

## Task 2: Download Sprites

**Files:**
- Create: `sprites/cat/walk.gif`, `sprites/cat/idle.gif`, `sprites/cat/sit.gif`, `sprites/cat/click.gif`
- Create: `sprites/dog/walk.gif`, `sprites/dog/idle.gif`, `sprites/dog/sit.gif`, `sprites/dog/click.gif`
- Create: `sprites/dino/walk.gif`, `sprites/dino/idle.gif`, `sprites/dino/sit.gif`, `sprites/dino/click.gif`

VS Code Pets (MIT licensed) is at `https://github.com/tonybaloney/vscode-pets`. Its `media/` folder contains sprite GIFs per pet.

- [ ] **Step 1: Browse the repo's media folder**

Open `https://github.com/tonybaloney/vscode-pets/tree/main/media` and explore the subfolders for `cat`, `dog`, and `dino` (or `rubberduck` / `cockatiel` if dino isn't available — pick whichever look best).

For each pet, identify a GIF for each of these four roles:
- **walk** — a looping walk cycle
- **idle** — a standing/breathing loop
- **sit** — a sitting pose (use idle if sit isn't available)
- **click** — a reaction animation (use idle if not available)

- [ ] **Step 2: Download and rename sprites**

For each pet, download the chosen GIFs and save them to `sprites/<pet>/` with the canonical filenames (`walk.gif`, `idle.gif`, `sit.gif`, `click.gif`). Example using curl (replace URLs with actual raw GitHub URLs you found in Step 1):

```bash
# Example — replace with actual raw URLs
curl -L "https://raw.githubusercontent.com/tonybaloney/vscode-pets/main/media/cat/idle_8fps.gif" \
  -o sprites/cat/idle.gif
```

Repeat for all 4 states × 3 pets = 12 files total.

- [ ] **Step 3: Verify**

```bash
ls sprites/cat/ sprites/dog/ sprites/dino/
```

Expected: each folder contains `walk.gif`, `idle.gif`, `sit.gif`, `click.gif`.

- [ ] **Step 4: Commit**

```bash
git add sprites/
git commit -m "feat: add MIT-licensed pixel art sprites (VS Code Pets)"
```

---

## Task 3: Config Parser

**Files:**
- Create: `src/config.js`
- Create: `tests/config.test.js`

- [ ] **Step 1: Write the failing tests**

Create `tests/config.test.js`:

```js
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
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
npm test -- tests/config.test.js
```

Expected: FAIL — `Cannot find module '../src/config.js'`

- [ ] **Step 3: Implement `src/config.js`**

Create `src/config.js`:

```js
const VALID_PETS = ['cat', 'dog', 'dino'];
const DEFAULTS = { pet: 'dino', scale: 2, speed: 3, floor: 0 };

export function parseConfig(raw = {}) {
  const pet = VALID_PETS.includes(raw.pet) ? raw.pet : DEFAULTS.pet;
  const scale = (typeof raw.scale === 'number' && raw.scale > 0) ? raw.scale : DEFAULTS.scale;
  const speed = (typeof raw.speed === 'number' && raw.speed > 0) ? raw.speed : DEFAULTS.speed;
  const floor = (typeof raw.floor === 'number') ? raw.floor : DEFAULTS.floor;
  return { pet, scale, speed, floor };
}
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
npm test -- tests/config.test.js
```

Expected: PASS — 15 tests pass.

- [ ] **Step 5: Commit**

```bash
git add src/config.js tests/config.test.js
git commit -m "feat: config parser with defaults and validation"
```

---

## Task 4: Sprite Manifest

**Files:**
- Create: `src/sprites.js`
- Create: `tests/sprites.test.js`

- [ ] **Step 1: Write the failing tests**

Create `tests/sprites.test.js`:

```js
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
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
npm test -- tests/sprites.test.js
```

Expected: FAIL — `Cannot find module '../src/sprites.js'`

- [ ] **Step 3: Implement `src/sprites.js`**

Create `src/sprites.js`:

```js
const STATE_TO_FILE = {
  'walk-right':    { file: 'walk.gif', flip: false },
  'walk-left':     { file: 'walk.gif', flip: true  },
  'idle':          { file: 'idle.gif', flip: false },
  'sitting':       { file: 'sit.gif',  flip: false },
  'follow-cursor': { file: 'walk.gif', flip: false },
  'clicked':       { file: 'click.gif',flip: false },
};

const FALLBACK = { file: 'idle.gif', flip: false };

export function getSpriteUrl(pet, state, base) {
  const { file, flip } = STATE_TO_FILE[state] || FALLBACK;
  return { url: `${base}sprites/${pet}/${file}`, flip };
}

export function getScriptBase() {
  const scripts = document.querySelectorAll('script[src]');
  for (let i = scripts.length - 1; i >= 0; i--) {
    const src = scripts[i].src;
    if (src.includes('site-pet')) {
      return src.substring(0, src.lastIndexOf('/') + 1);
    }
  }
  return './';
}
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
npm test -- tests/sprites.test.js
```

Expected: PASS — 8 tests pass.

- [ ] **Step 5: Commit**

```bash
git add src/sprites.js tests/sprites.test.js
git commit -m "feat: sprite manifest mapping states to GIF URLs"
```

---

## Task 5: State Machine

**Files:**
- Create: `src/state-machine.js`
- Create: `tests/state-machine.test.js`

- [ ] **Step 1: Write the failing tests**

Create `tests/state-machine.test.js`:

```js
const { StateMachine, STATES } = require('../src/state-machine.js');

describe('StateMachine', () => {
  let sm;

  beforeEach(() => {
    jest.useFakeTimers();
    sm = new StateMachine();
  });

  afterEach(() => {
    sm.stop();
    jest.useRealTimers();
  });

  test('starts in walk-right state', () => {
    expect(sm.state).toBe(STATES.WALK_RIGHT);
  });

  test('onEdge right → flips to walk-left when walking right', () => {
    sm.state = STATES.WALK_RIGHT;
    sm.onEdge('right');
    expect(sm.state).toBe(STATES.WALK_LEFT);
  });

  test('onEdge left → flips to walk-right when walking left', () => {
    sm.state = STATES.WALK_LEFT;
    sm.onEdge('left');
    expect(sm.state).toBe(STATES.WALK_RIGHT);
  });

  test('onEdge right does nothing when walking left', () => {
    sm.state = STATES.WALK_LEFT;
    sm.onEdge('right');
    expect(sm.state).toBe(STATES.WALK_LEFT);
  });

  test('onEdge left does nothing when walking right', () => {
    sm.state = STATES.WALK_RIGHT;
    sm.onEdge('left');
    expect(sm.state).toBe(STATES.WALK_RIGHT);
  });

  test('onCursorNear → switches to follow-cursor', () => {
    sm.onCursorNear();
    expect(sm.state).toBe(STATES.FOLLOW_CURSOR);
  });

  test('onCursorNear does nothing when already in clicked', () => {
    sm.state = STATES.CLICKED;
    sm.onCursorNear();
    expect(sm.state).toBe(STATES.CLICKED);
  });

  test('onCursorFar → resumes pre-interrupt state', () => {
    sm._preInterruptState = STATES.WALK_LEFT;
    sm.onCursorNear();
    sm.onCursorFar();
    expect(sm.state).toBe(STATES.WALK_LEFT);
  });

  test('onCursorFar does nothing when not following cursor', () => {
    sm.state = STATES.IDLE;
    sm.onCursorFar();
    expect(sm.state).toBe(STATES.IDLE);
  });

  test('onClick → switches to clicked', () => {
    sm.onClick();
    expect(sm.state).toBe(STATES.CLICKED);
  });

  test('onClick does nothing when already clicked', () => {
    sm.onClick();
    sm.onClick();
    expect(sm.state).toBe(STATES.CLICKED);
  });

  test('onClickEnd → resumes pre-interrupt state', () => {
    sm._preInterruptState = STATES.IDLE;
    sm.onClick();
    sm.onClickEnd();
    expect(sm.state).toBe(STATES.IDLE);
  });

  test('setOnTransition callback fires on state change', () => {
    const cb = jest.fn();
    sm.setOnTransition(cb);
    sm.onClick();
    expect(cb).toHaveBeenCalledWith(STATES.CLICKED);
  });

  test('setOnTransition callback fires on edge bounce', () => {
    const cb = jest.fn();
    sm.setOnTransition(cb);
    sm.onEdge('right');
    expect(cb).toHaveBeenCalledWith(STATES.WALK_LEFT);
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
npm test -- tests/state-machine.test.js
```

Expected: FAIL — `Cannot find module '../src/state-machine.js'`

- [ ] **Step 3: Implement `src/state-machine.js`**

Create `src/state-machine.js`:

```js
export const STATES = {
  WALK_RIGHT:    'walk-right',
  WALK_LEFT:     'walk-left',
  IDLE:          'idle',
  SITTING:       'sitting',
  FOLLOW_CURSOR: 'follow-cursor',
  CLICKED:       'clicked',
};

function randomBetween(min, max) {
  return Math.floor(Math.random() * (max - min)) + min;
}

export class StateMachine {
  constructor() {
    this.state = STATES.WALK_RIGHT;
    this._preInterruptState = STATES.WALK_RIGHT;
    this._timer = null;
    this._onTransition = null;
  }

  setOnTransition(cb) {
    this._onTransition = cb;
  }

  _transition(newState) {
    this.state = newState;
    if (this._onTransition) this._onTransition(newState);
  }

  start() {
    this._scheduleNext();
  }

  stop() {
    if (this._timer) clearTimeout(this._timer);
    this._timer = null;
  }

  _scheduleNext() {
    const delays = {
      [STATES.WALK_RIGHT]: randomBetween(3000, 8000),
      [STATES.WALK_LEFT]:  randomBetween(3000, 8000),
      [STATES.IDLE]:       randomBetween(2000, 4000),
      [STATES.SITTING]:    randomBetween(2000, 5000),
    };
    const delay = delays[this.state] ?? 3000;
    this._timer = setTimeout(() => this._autonomousTransition(), delay);
  }

  _autonomousTransition() {
    const next = {
      [STATES.WALK_RIGHT]: STATES.IDLE,
      [STATES.WALK_LEFT]:  STATES.IDLE,
      [STATES.IDLE]:       STATES.SITTING,
      [STATES.SITTING]:    Math.random() > 0.5 ? STATES.WALK_RIGHT : STATES.WALK_LEFT,
    }[this.state] || STATES.WALK_RIGHT;

    this._preInterruptState = next;
    this._transition(next);
    this._scheduleNext();
  }

  onEdge(edge) {
    if (edge === 'right' && this.state === STATES.WALK_RIGHT) {
      this._preInterruptState = STATES.WALK_LEFT;
      this._transition(STATES.WALK_LEFT);
    } else if (edge === 'left' && this.state === STATES.WALK_LEFT) {
      this._preInterruptState = STATES.WALK_RIGHT;
      this._transition(STATES.WALK_RIGHT);
    }
  }

  onCursorNear() {
    if (this.state === STATES.CLICKED) return;
    if (this.state !== STATES.FOLLOW_CURSOR) {
      this._transition(STATES.FOLLOW_CURSOR);
    }
  }

  onCursorFar() {
    if (this.state === STATES.FOLLOW_CURSOR) {
      this._transition(this._preInterruptState);
    }
  }

  onClick() {
    if (this.state === STATES.CLICKED) return;
    this._transition(STATES.CLICKED);
  }

  onClickEnd() {
    this._transition(this._preInterruptState);
  }
}
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
npm test -- tests/state-machine.test.js
```

Expected: PASS — 15 tests pass.

- [ ] **Step 5: Commit**

```bash
git add src/state-machine.js tests/state-machine.test.js
git commit -m "feat: pet state machine with autonomous transitions and interactions"
```

---

## Task 6: Cursor Utilities

**Files:**
- Create: `src/cursor.js`
- Create: `tests/cursor.test.js`

- [ ] **Step 1: Write the failing tests**

Create `tests/cursor.test.js`:

```js
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
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
npm test -- tests/cursor.test.js
```

Expected: FAIL — `Cannot find module '../src/cursor.js'`

- [ ] **Step 3: Implement `src/cursor.js`**

Create `src/cursor.js`:

```js
export function isNear(el, cursorX, cursorY, threshold = 100) {
  const rect = el.getBoundingClientRect();
  const cx = rect.left + rect.width / 2;
  const cy = rect.top + rect.height / 2;
  const dx = cursorX - cx;
  const dy = cursorY - cy;
  return (dx * dx + dy * dy) < (threshold * threshold);
}

export function cursorDirection(el, cursorX) {
  const rect = el.getBoundingClientRect();
  return cursorX >= rect.left + rect.width / 2 ? 'right' : 'left';
}

export function setupCursorTracking({ getEl, onNear, onFar, onPetClick }) {
  let cursorX = -9999;
  let cursorY = -9999;
  let near = false;

  function handleMove(e) {
    cursorX = e.clientX;
    cursorY = e.clientY;
    const nowNear = isNear(getEl(), cursorX, cursorY);
    if (nowNear && !near) { near = true;  onNear(); }
    if (!nowNear && near)  { near = false; onFar();  }
  }

  function handleClick(e) {
    if (isNear(getEl(), e.clientX, e.clientY, 50)) onPetClick();
  }

  document.addEventListener('mousemove', handleMove);
  document.addEventListener('click', handleClick);

  return {
    getCursorX: () => cursorX,
    teardown() {
      document.removeEventListener('mousemove', handleMove);
      document.removeEventListener('click', handleClick);
    },
  };
}
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
npm test -- tests/cursor.test.js
```

Expected: PASS — 6 tests pass.

- [ ] **Step 5: Commit**

```bash
git add src/cursor.js tests/cursor.test.js
git commit -m "feat: cursor proximity detection and direction utilities"
```

---

## Task 7: DOM Renderer

**Files:**
- Create: `src/renderer.js`
- Create: `tests/renderer.test.js`

- [ ] **Step 1: Write the failing tests**

Create `tests/renderer.test.js`:

```js
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
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
npm test -- tests/renderer.test.js
```

Expected: FAIL — `Cannot find module '../src/renderer.js'`

- [ ] **Step 3: Implement `src/renderer.js`**

Create `src/renderer.js`:

```js
export function createRenderer({ floor, scale }) {
  const container = document.createElement('div');
  container.id = 'site-pet-container';
  Object.assign(container.style, {
    position:      'fixed',
    bottom:        `${floor}px`,
    left:          '0px',
    zIndex:        '99999',
    pointerEvents: 'auto',
    cursor:        'pointer',
    userSelect:    'none',
    lineHeight:    '0',
  });

  const img = document.createElement('img');
  img.alt = '';
  Object.assign(img.style, {
    imageRendering: 'pixelated',
    display:        'block',
  });

  container.appendChild(img);
  document.body.appendChild(container);

  return {
    setPosition(x) {
      container.style.left = `${x}px`;
    },
    setSprite(url, flip, currentScale) {
      img.src = url;
      const sc = currentScale || scale;
      img.style.transform = flip
        ? `scaleX(-1) scale(${sc})`
        : `scale(${sc})`;
      img.style.transformOrigin = 'bottom left';
    },
    getElement() {
      return container;
    },
    getWidth() {
      return (img.naturalWidth || 32) * scale;
    },
    remove() {
      container.remove();
    },
  };
}
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
npm test -- tests/renderer.test.js
```

Expected: PASS — 7 tests pass.

- [ ] **Step 5: Run the full test suite to check nothing is broken**

```bash
npm test
```

Expected: All test files pass.

- [ ] **Step 6: Commit**

```bash
git add src/renderer.js tests/renderer.test.js
git commit -m "feat: DOM renderer — injects pet element and manages sprite/position"
```

---

## Task 8: Entry Point & RAF Loop

**Files:**
- Create: `src/index.js`

No unit tests for this file — it's integration glue. Visual verification happens in Task 9 via the demo page.

- [ ] **Step 1: Create `src/index.js`**

```js
import { parseConfig } from './config.js';
import { getSpriteUrl, getScriptBase } from './sprites.js';
import { StateMachine, STATES } from './state-machine.js';
import { createRenderer } from './renderer.js';
import { setupCursorTracking, cursorDirection } from './cursor.js';

function init() {
  const config = parseConfig(window.SitePetConfig);
  const base = getScriptBase();

  const sm = new StateMachine();
  const renderer = createRenderer(config);

  let x = Math.random() * Math.max(0, window.innerWidth - 64);
  let cursorX = -9999;

  function applySprite(state) {
    const { url, flip: baseFlip } = getSpriteUrl(config.pet, state, base);
    let flip = baseFlip;
    if (state === STATES.FOLLOW_CURSOR) {
      flip = cursorDirection(renderer.getElement(), cursorX) === 'left';
    }
    renderer.setSprite(url, flip, config.scale);
  }

  // Sprite on error: silently remove pet
  renderer.getElement().querySelector('img').addEventListener('error', () => {
    renderer.remove();
    sm.stop();
  });

  sm.setOnTransition((state) => applySprite(state));
  applySprite(STATES.WALK_RIGHT);
  renderer.setPosition(x);

  const cursor = setupCursorTracking({
    getEl: () => renderer.getElement(),
    onNear: () => sm.onCursorNear(),
    onFar:  () => sm.onCursorFar(),
    onPetClick: () => {
      sm.onClick();
      setTimeout(() => sm.onClickEnd(), 800);
    },
  });

  // Keep cursorX updated for follow-cursor direction
  document.addEventListener('mousemove', (e) => { cursorX = e.clientX; });

  let lastTime = null;
  function loop(timestamp) {
    if (!lastTime) lastTime = timestamp;
    const dt = Math.min(timestamp - lastTime, 50); // cap at 50ms to avoid jumps
    lastTime = timestamp;

    const state = sm.state;
    const vw = window.innerWidth;
    const pw = renderer.getWidth();
    const pxPerFrame = config.speed * dt / 16;

    if (state === STATES.WALK_RIGHT) {
      x = Math.min(x + pxPerFrame, vw - pw);
      if (x >= vw - pw) sm.onEdge('right');
    } else if (state === STATES.WALK_LEFT) {
      x = Math.max(x - pxPerFrame, 0);
      if (x <= 0) sm.onEdge('left');
    } else if (state === STATES.FOLLOW_CURSOR) {
      const target = cursorX - pw / 2;
      const diff = target - x;
      x += Math.sign(diff) * Math.min(Math.abs(diff), config.speed * 2 * dt / 16);
      x = Math.max(0, Math.min(x, vw - pw));
      applySprite(state); // update flip direction each frame
    }

    renderer.setPosition(Math.round(x));
    requestAnimationFrame(loop);
  }

  sm.start();
  requestAnimationFrame(loop);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
```

- [ ] **Step 2: Verify all tests still pass**

```bash
npm test
```

Expected: All existing tests pass (index.js has no direct tests).

- [ ] **Step 3: Commit**

```bash
git add src/index.js
git commit -m "feat: main entry point wiring config, state machine, renderer, and RAF loop"
```

---

## Task 9: Build & Demo Page

**Files:**
- Create: `demo/index.html`
- Create: `site-pet.js` (generated by build)

- [ ] **Step 1: Run the build**

```bash
npm run build
```

Expected: `site-pet.js` created in project root with no errors.

- [ ] **Step 2: Create `demo/index.html`**

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Site Pet Demo</title>
  <style>
    body {
      min-height: 300vh;
      font-family: sans-serif;
      padding: 40px;
      background: #f5f5f5;
      color: #333;
    }
    h1 { margin-bottom: 8px; }
    p  { max-width: 600px; line-height: 1.7; }
    .controls { margin: 24px 0; display: flex; gap: 12px; flex-wrap: wrap; }
    button {
      padding: 8px 16px;
      border: 1px solid #ccc;
      border-radius: 6px;
      background: white;
      cursor: pointer;
      font-size: 14px;
    }
  </style>
</head>
<body>
  <h1>🐾 Site Pet Demo</h1>
  <p>
    A pixel-art pet walks along the bottom of the viewport.
    <strong>Hover near it</strong> to make it follow your cursor.
    <strong>Click it</strong> for a reaction.
    Scroll down — it stays fixed to the viewport.
  </p>

  <div class="controls">
    <button onclick="switchPet('dino')">Switch to Dino</button>
    <button onclick="switchPet('cat')">Switch to Cat</button>
    <button onclick="switchPet('dog')">Switch to Dog</button>
  </div>

  <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Scroll down to see the pet stays fixed...</p>
  <p style="margin-top: 100vh">Bottom of page reached.</p>

  <script>
    function switchPet(type) {
      // Remove existing pet and reinitialize with new type
      const el = document.getElementById('site-pet-container');
      if (el) el.remove();
      window.SitePetConfig = { pet: type, scale: 2, speed: 3, floor: 0 };
      // Re-run init — relies on the IIFE exposing nothing, so reload the script
      const s = document.createElement('script');
      s.src = '../site-pet.js?t=' + Date.now();
      document.body.appendChild(s);
    }
  </script>

  <script>
    window.SitePetConfig = {
      pet: 'dino',
      scale: 2,
      speed: 3,
      floor: 0,
    };
  </script>
  <script src="../site-pet.js"></script>
</body>
</html>
```

- [ ] **Step 3: Serve the demo and verify visually**

```bash
npx http-server . -p 8080 -o /demo/index.html
```

Open `http://localhost:8080/demo/index.html` in your browser.

**Visual checklist:**
- [ ] Pet appears at the bottom of the viewport
- [ ] Pet walks left and right, bouncing off edges
- [ ] Pet periodically stops (idle) and sits
- [ ] Pet follows your cursor when you hover near it
- [ ] Pet plays a reaction animation when you click it
- [ ] Pet stays fixed to the viewport while scrolling
- [ ] Switching pet type (buttons) shows the correct sprite

- [ ] **Step 4: Commit**

```bash
git add site-pet.js demo/index.html
git commit -m "feat: build output and demo page"
```

---

## Task 10: Add .gitignore

**Files:**
- Create: `.gitignore`

- [ ] **Step 1: Create `.gitignore`**

```
node_modules/
.superpowers/
```

- [ ] **Step 2: Commit**

```bash
git add .gitignore
git commit -m "chore: add .gitignore"
```

---

## Self-Review Notes

**Spec coverage check:**
- ✅ Pets: dino (default), cat, dog — covered in config parser + sprite manifest
- ✅ States: walk-right, walk-left, idle, sitting, follow-cursor, clicked — all in state machine
- ✅ Edge bounce — `sm.onEdge()` called in RAF loop
- ✅ Cursor proximity (100px) — `isNear()` uses 100 as default threshold
- ✅ Click reaction + resume — `sm.onClick()` + 800ms `setTimeout` for `onClickEnd()`
- ✅ Single script tag embed — IIFE bundle from esbuild
- ✅ Config object `window.SitePetConfig` — Task 3
- ✅ Sprite error → silent remove — `img.onerror` in index.js
- ✅ Invalid pet falls back to dino — config parser
- ✅ Unknown config keys ignored — config parser only reads known keys

**Deviation from spec:** The spec mentions sprite sheets with `background-position` stepping. We use individual GIF files with `<img src>` swapping instead, because VS Code Pets (the specified sprite source) uses GIFs. This is simpler and achieves the same visual result.
