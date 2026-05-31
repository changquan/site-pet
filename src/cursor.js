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
    if (isNear(getEl(), e.clientX, e.clientY, 80)) onPetClick();
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
