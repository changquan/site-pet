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
  let running = true;

  function applySprite(state) {
    const { url, flip: baseFlip } = getSpriteUrl(config.pet, state, base);
    let flip = baseFlip;
    if (state === STATES.FOLLOW_CURSOR) {
      flip = cursorDirection(renderer.getElement(), cursor.getCursorX()) === 'left';
    }
    renderer.setSprite(url, flip, config.scale);
  }

  // Sprite on error: silently remove pet
  renderer.getElement().querySelector('img').addEventListener('error', () => {
    running = false;
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

  let lastTime = null;
  function loop(timestamp) {
    if (!running) return;
    if (lastTime === null) lastTime = timestamp;
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
      const target = cursor.getCursorX() - pw / 2;
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
