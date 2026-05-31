function createRenderer({ floor, scale }) {
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

module.exports = { createRenderer };
