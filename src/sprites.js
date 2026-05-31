const STATE_TO_FILE = {
  'walk-right':    { file: 'walk.gif', flip: false },
  'walk-left':     { file: 'walk.gif', flip: true  },
  'idle':          { file: 'idle.gif', flip: false },
  'sitting':       { file: 'sit.gif',  flip: false },
  'follow-cursor': { file: 'walk.gif', flip: false },
  'clicked':       { file: 'click.gif', flip: false },
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
