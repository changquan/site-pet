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

  // GIF mode element
  const img = document.createElement('img');
  img.alt = '';
  Object.assign(img.style, {
    imageRendering: 'pixelated',
    display:        'block',
  });

  // Sprite sheet mode element
  const sheet = document.createElement('div');
  Object.assign(sheet.style, {
    imageRendering: 'pixelated',
    display:        'none',
    backgroundRepeat: 'no-repeat',
  });

  container.appendChild(img);
  container.appendChild(sheet);
  document.body.appendChild(container);

  let _mode = 'gif';

  return {
    setPosition(x) {
      container.style.left = `${x}px`;
    },

    setSprite(url, flip, currentScale) {
      _mode = 'gif';
      img.style.display = 'block';
      sheet.style.display = 'none';
      img.src = url;
      const sc = currentScale || scale;
      img.style.transform = flip ? `scaleX(-1) scale(${sc})` : `scale(${sc})`;
      img.style.transformOrigin = 'bottom left';
    },

    setSheetFrame(url, frameX, frameY, frameW, frameH, sheetW, sheetH, flip, currentScale) {
      _mode = 'sheet';
      img.style.display = 'none';
      sheet.style.display = 'block';
      const sc = currentScale || scale;
      const w = Math.round(frameW * sc);
      const h = Math.round(frameH * sc);
      sheet.style.width  = `${w}px`;
      sheet.style.height = `${h}px`;
      sheet.style.backgroundImage    = `url(${url})`;
      sheet.style.backgroundSize     = `${Math.round(sheetW * sc)}px ${Math.round(sheetH * sc)}px`;
      sheet.style.backgroundPosition = `-${Math.round(frameX * sc)}px -${Math.round(frameY * sc)}px`;
      sheet.style.transform          = flip ? 'scaleX(-1)' : 'none';
      sheet.style.transformOrigin    = 'bottom left';
    },

    getElement() {
      return container;
    },

    getWidth() {
      if (_mode === 'sheet') return parseFloat(sheet.style.width) || 64;
      return (img.naturalWidth || 32) * scale;
    },

    remove() {
      container.remove();
    },
  };
}
