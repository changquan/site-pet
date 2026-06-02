const GIF_STATES = {
  'walk-right':    { file: 'walk.gif',  flip: false },
  'walk-left':     { file: 'walk.gif',  flip: true  },
  'idle':          { file: 'idle.gif',  flip: false },
  'sitting':       { file: 'sit.gif',   flip: false },
  'follow-cursor': { file: 'walk.gif',  flip: false },
  'clicked':       { file: 'click.gif', flip: false },
};
const GIF_FALLBACK = { file: 'idle.gif', flip: false };

const DRAGO_GIF_STATES = {
  'walk-right': { file: 'drago-walk-v1.gif',    flip: false },
  'walk-left':  { file: 'drago-walk-v1.gif',    flip: true  },
  'sleeping':   { file: 'drago-sleep-v3.gif',   flip: false },
  'clicked':    { file: 'drago-sneeze-spark.gif', flip: false },
};
const DRAGO_GIF_FALLBACK = { file: 'drago-sleep-v3.gif', flip: false };

const DINO_GIF_STATES = {
  'walk-right': { file: 'dino-walk-v1.gif',  flip: false },
  'walk-left':  { file: 'dino-walk-v1.gif',  flip: true  },
  'sleeping':   { file: 'dino-sleep-v1.gif', flip: false },
};
const DINO_GIF_FALLBACK = { file: 'dino-sleep-v1.gif', flip: false };

export function getSpriteInfo(pet, state, base) {
  if (pet === 'drago') {
    const { file, flip } = DRAGO_GIF_STATES[state] || DRAGO_GIF_FALLBACK;
    return { type: 'gif', url: `${base}sprites/drago/${file}`, flip };
  }
  if (pet === 'dino') {
    const { file, flip } = DINO_GIF_STATES[state] || DINO_GIF_FALLBACK;
    return { type: 'gif', url: `${base}sprites/dino/${file}`, flip };
  }
  const { file, flip } = GIF_STATES[state] || GIF_FALLBACK;
  return { type: 'gif', url: `${base}sprites/${pet}/${file}`, flip };
}

// Kept for backward compat with existing tests
export function getSpriteUrl(pet, state, base) {
  const { file, flip } = GIF_STATES[state] || GIF_FALLBACK;
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
