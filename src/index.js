import { parseConfig } from './config.js';
import { getSpriteInfo, getScriptBase } from './sprites.js';
import { StateMachine, STATES } from './state-machine.js';
import { createRenderer } from './renderer.js';
import { setupCursorTracking } from './cursor.js';

function init() {
  const config = parseConfig(window.SitePetConfig);
  const base = getScriptBase();

  const smConfig = (config.pet === 'dino' || config.pet === 'drago') ? {
    delays: {
      [STATES.WALK_RIGHT]: [3000, 8000],
      [STATES.WALK_LEFT]:  [3000, 8000],
      [STATES.SLEEPING]:   [4000, 8000],
    },
    transitions: {
      [STATES.WALK_RIGHT]: STATES.SLEEPING,
      [STATES.WALK_LEFT]:  STATES.SLEEPING,
      [STATES.SLEEPING]:   () => Math.random() > 0.5 ? STATES.WALK_RIGHT : STATES.WALK_LEFT,
    },
  } : {};
  const sm = new StateMachine(smConfig);
  const renderer = createRenderer(config);

  let x = Math.random() * Math.max(0, window.innerWidth - 64);
  let running = true;

  // Sheet animation state
  let frameTimer = null;
  let frameIdx = 0;
  let currentAnimState = null;
  let currentFlip = false;

  function stopSheetAnim() {
    if (frameTimer) { clearInterval(frameTimer); frameTimer = null; }
  }

  function startSheetAnim(info, state, flip) {
    currentFlip = flip;
    if (currentAnimState === state) return; // same state — just update flip
    currentAnimState = state;
    frameIdx = 0;
    stopSheetAnim();
    function showFrame() {
      const [fx, fy] = info.frames[frameIdx % info.frames.length];
      renderer.setSheetFrame(info.url, fx, fy, info.frameW, info.frameH, info.sheetW, info.sheetH, currentFlip, config.scale);
      frameIdx++;
    }
    showFrame();
    frameTimer = setInterval(showFrame, 150);
  }

  function applySprite(state) {
    const info = getSpriteInfo(config.pet, state, base);
    const flip = info.flip;
    if (info.type === 'sheet') {
      startSheetAnim(info, state, flip);
    } else {
      stopSheetAnim();
      currentAnimState = null;
      renderer.setSprite(info.url, flip, config.scale);
    }
  }

  // Sprite error: silently remove pet
  renderer.getElement().querySelector('img').addEventListener('error', () => {
    running = false;
    stopSheetAnim();
    renderer.remove();
    sm.stop();
  });

  sm.setOnTransition((state) => applySprite(state));
  applySprite(STATES.WALK_RIGHT);
  renderer.setPosition(x);

  const clickDuration = config.pet === 'drago' ? 3000 : 800;
  if (config.pet !== 'dino') {
    setupCursorTracking({
      getEl: () => renderer.getElement(),
      onPetClick: () => {
        sm.onClick();
        setTimeout(() => sm.onClickEnd(), clickDuration);
      },
    });
  }

  let lastTime = null;
  function loop(timestamp) {
    if (!running) return;
    if (lastTime === null) lastTime = timestamp;
    const dt = Math.min(timestamp - lastTime, 50);
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
