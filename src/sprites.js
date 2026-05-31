const GIF_STATES = {
  'walk-right':    { file: 'walk.gif',  flip: false },
  'walk-left':     { file: 'walk.gif',  flip: true  },
  'idle':          { file: 'idle.gif',  flip: false },
  'sitting':       { file: 'sit.gif',   flip: false },
  'follow-cursor': { file: 'walk.gif',  flip: false },
  'clicked':       { file: 'click.gif', flip: false },
};
const GIF_FALLBACK = { file: 'idle.gif', flip: false };

// dino2.png: 192x192px frames, 8 cols x 5 rows (bottom 64px is label strip)
// Row 0: WALK (6 frames), Row 1: IDLE (4), Row 2: SIT (3), Row 3: SLEEP (4), Row 4: REACT (4)
const FW = 192, FH = 192;
const DINO_SHEET = {
  file: 'sprites/dino2.png',
  frameW: FW,
  frameH: FH,
  sheetW: 1536,
  sheetH: 1024,
  states: {
    'walk-right':    { frames: [[0,0],[FW,0],[FW*2,0],[FW*3,0],[FW*4,0],[FW*5,0]], flip: false },
    'walk-left':     { frames: [[0,0],[FW,0],[FW*2,0],[FW*3,0],[FW*4,0],[FW*5,0]], flip: true  },
    'idle':          { frames: [[0,FH],[FW,FH],[FW*2,FH],[FW*3,FH]], flip: false },
    'sitting':       { frames: [[0,FH*2],[FW,FH*2],[FW*2,FH*2]], flip: false },
    'follow-cursor': { frames: [[0,0],[FW,0],[FW*2,0],[FW*3,0],[FW*4,0],[FW*5,0]], flip: false },
    'clicked':       { frames: [[0,FH*4],[FW,FH*4],[FW*2,FH*4],[FW*3,FH*4]], flip: false },
  },
};

export function getSpriteInfo(pet, state, base) {
  if (pet === 'dino') {
    const s = DINO_SHEET.states[state] || DINO_SHEET.states['idle'];
    return {
      type:   'sheet',
      url:    `${base}${DINO_SHEET.file}`,
      frames: s.frames,
      frameW: DINO_SHEET.frameW,
      frameH: DINO_SHEET.frameH,
      sheetW: DINO_SHEET.sheetW,
      sheetH: DINO_SHEET.sheetH,
      flip:   s.flip,
    };
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
