export function isNear(el, cursorX, cursorY, threshold = 100) {
  const rect = el.getBoundingClientRect();
  const cx = rect.left + rect.width / 2;
  const cy = rect.top + rect.height / 2;
  const dx = cursorX - cx;
  const dy = cursorY - cy;
  return (dx * dx + dy * dy) < (threshold * threshold);
}

export function setupCursorTracking({ getEl, onPetClick }) {
  function handleClick(e) {
    if (isNear(getEl(), e.clientX, e.clientY, 80)) onPetClick();
  }

  document.addEventListener('click', handleClick);

  return {
    teardown() {
      document.removeEventListener('click', handleClick);
    },
  };
}
