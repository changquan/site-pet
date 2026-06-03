(() => {
  // src/config.js
  var VALID_PETS = ["dog", "dino", "drago"];
  var DEFAULTS = { pet: "dog", scale: 2, speed: 3, floor: 0 };
  function parseConfig(raw = {}) {
    const pet = VALID_PETS.includes(raw.pet) ? raw.pet : DEFAULTS.pet;
    const scale = typeof raw.scale === "number" && raw.scale > 0 ? raw.scale : DEFAULTS.scale;
    const speed = typeof raw.speed === "number" && raw.speed > 0 ? raw.speed : DEFAULTS.speed;
    const floor = typeof raw.floor === "number" ? raw.floor : DEFAULTS.floor;
    return { pet, scale, speed, floor };
  }

  // src/sprites.js
  var GIF_STATES = {
    "walk-right": { file: "walk.gif", flip: false },
    "walk-left": { file: "walk.gif", flip: true },
    "idle": { file: "idle.gif", flip: false },
    "sitting": { file: "sit.gif", flip: false },
    "clicked": { file: "click.gif", flip: false }
  };
  var GIF_FALLBACK = { file: "idle.gif", flip: false };
  var DRAGO_GIF_STATES = {
    "walk-right": { file: "drago-walk-v1.gif", flip: false },
    "walk-left": { file: "drago-walk-v1.gif", flip: true },
    "sleeping": { file: "drago-sleep-v3.gif", flip: false },
    "clicked": { file: "drago-sneeze-spark.gif", flip: false }
  };
  var DRAGO_GIF_FALLBACK = { file: "drago-sleep-v3.gif", flip: false };
  var DINO_GIF_STATES = {
    "walk-right": { file: "dino-walk-v1.gif", flip: false },
    "walk-left": { file: "dino-walk-v1.gif", flip: true },
    "sleeping": { file: "dino-sleep-v1.gif", flip: false }
  };
  var DINO_GIF_FALLBACK = { file: "dino-sleep-v1.gif", flip: false };
  function getSpriteInfo(pet, state, base) {
    if (pet === "drago") {
      const { file: file2, flip: flip2 } = DRAGO_GIF_STATES[state] || DRAGO_GIF_FALLBACK;
      return { type: "gif", url: `${base}sprites/drago/${file2}`, flip: flip2 };
    }
    if (pet === "dino") {
      const { file: file2, flip: flip2 } = DINO_GIF_STATES[state] || DINO_GIF_FALLBACK;
      return { type: "gif", url: `${base}sprites/dino/${file2}`, flip: flip2 };
    }
    const { file, flip } = GIF_STATES[state] || GIF_FALLBACK;
    return { type: "gif", url: `${base}sprites/${pet}/${file}`, flip };
  }
  function getScriptBase() {
    const scripts = document.querySelectorAll("script[src]");
    for (let i = scripts.length - 1; i >= 0; i--) {
      const src = scripts[i].src;
      if (src.includes("site-pet")) {
        return src.substring(0, src.lastIndexOf("/") + 1);
      }
    }
    return "./";
  }

  // src/state-machine.js
  var STATES = {
    WALK_RIGHT: "walk-right",
    WALK_LEFT: "walk-left",
    IDLE: "idle",
    SITTING: "sitting",
    CLICKED: "clicked",
    SLEEPING: "sleeping"
  };
  var DEFAULT_DELAYS = {
    [STATES.WALK_RIGHT]: [3e3, 8e3],
    [STATES.WALK_LEFT]: [3e3, 8e3],
    [STATES.IDLE]: [2e3, 4e3],
    [STATES.SITTING]: [2e3, 5e3]
  };
  var DEFAULT_TRANSITIONS = {
    [STATES.WALK_RIGHT]: STATES.IDLE,
    [STATES.WALK_LEFT]: STATES.IDLE,
    [STATES.IDLE]: STATES.SITTING,
    [STATES.SITTING]: () => Math.random() > 0.5 ? STATES.WALK_RIGHT : STATES.WALK_LEFT
  };
  function randomBetween(min, max) {
    return Math.floor(Math.random() * (max - min)) + min;
  }
  var StateMachine = class {
    constructor({ delays, transitions } = {}) {
      this._delayRanges = delays || DEFAULT_DELAYS;
      this._transitions = transitions || DEFAULT_TRANSITIONS;
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
      if (this._onTransition)
        this._onTransition(newState);
    }
    start() {
      this._scheduleNext();
    }
    stop() {
      if (this._timer)
        clearTimeout(this._timer);
      this._timer = null;
    }
    _scheduleNext() {
      const range = this._delayRanges[this.state] || [3e3, 6e3];
      const delay = randomBetween(range[0], range[1]);
      this._timer = setTimeout(() => this._autonomousTransition(), delay);
    }
    _autonomousTransition() {
      const t = this._transitions[this.state];
      const next = (typeof t === "function" ? t() : t) || STATES.WALK_RIGHT;
      this._preInterruptState = next;
      this._transition(next);
      this._scheduleNext();
    }
    onEdge(edge) {
      if (edge === "right" && this.state === STATES.WALK_RIGHT) {
        this._preInterruptState = STATES.WALK_LEFT;
        this._transition(STATES.WALK_LEFT);
      } else if (edge === "left" && this.state === STATES.WALK_LEFT) {
        this._preInterruptState = STATES.WALK_RIGHT;
        this._transition(STATES.WALK_RIGHT);
      }
    }
    onClick() {
      if (this.state === STATES.CLICKED)
        return;
      this._transition(STATES.CLICKED);
    }
    onClickEnd() {
      this.stop();
      this._transition(this._preInterruptState);
      this._scheduleNext();
    }
  };

  // src/renderer.js
  function createRenderer({ floor, scale }) {
    const container = document.createElement("div");
    container.id = "site-pet-container";
    Object.assign(container.style, {
      position: "fixed",
      bottom: `${floor}px`,
      left: "0px",
      zIndex: "99999",
      pointerEvents: "auto",
      cursor: "pointer",
      userSelect: "none",
      lineHeight: "0"
    });
    const img = document.createElement("img");
    img.alt = "";
    Object.assign(img.style, {
      imageRendering: "pixelated",
      display: "block"
    });
    const sheet = document.createElement("div");
    Object.assign(sheet.style, {
      imageRendering: "pixelated",
      display: "none",
      backgroundRepeat: "no-repeat"
    });
    container.appendChild(img);
    container.appendChild(sheet);
    document.body.appendChild(container);
    let _mode = "gif";
    return {
      setPosition(x) {
        container.style.left = `${x}px`;
      },
      setSprite(url, flip, currentScale) {
        _mode = "gif";
        img.style.display = "block";
        sheet.style.display = "none";
        img.src = url;
        const sc = currentScale || scale;
        img.style.transform = flip ? `scaleX(-1) scale(${sc})` : `scale(${sc})`;
        img.style.transformOrigin = "bottom left";
      },
      setSheetFrame(url, frameX, frameY, frameW, frameH, sheetW, sheetH, flip, currentScale) {
        _mode = "sheet";
        img.style.display = "none";
        sheet.style.display = "block";
        const sc = currentScale || scale;
        const w = Math.round(frameW * sc);
        const h = Math.round(frameH * sc);
        sheet.style.width = `${w}px`;
        sheet.style.height = `${h}px`;
        sheet.style.backgroundImage = `url(${url})`;
        sheet.style.backgroundSize = `${Math.round(sheetW * sc)}px ${Math.round(sheetH * sc)}px`;
        sheet.style.backgroundPosition = `-${Math.round(frameX * sc)}px -${Math.round(frameY * sc)}px`;
        sheet.style.transform = flip ? "scaleX(-1)" : "none";
        sheet.style.transformOrigin = "bottom left";
      },
      getElement() {
        return container;
      },
      getWidth() {
        if (_mode === "sheet")
          return parseFloat(sheet.style.width) || 64;
        return (img.naturalWidth || 32) * scale;
      },
      remove() {
        container.remove();
      }
    };
  }

  // src/cursor.js
  function isNear(el, cursorX, cursorY, threshold = 100) {
    const rect = el.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const dx = cursorX - cx;
    const dy = cursorY - cy;
    return dx * dx + dy * dy < threshold * threshold;
  }
  function setupCursorTracking({ getEl, onPetClick }) {
    function handleClick(e) {
      if (isNear(getEl(), e.clientX, e.clientY, 80))
        onPetClick();
    }
    document.addEventListener("click", handleClick);
    return {
      teardown() {
        document.removeEventListener("click", handleClick);
      }
    };
  }

  // src/index.js
  function init() {
    const config = parseConfig(window.SitePetConfig);
    const base = getScriptBase();
    const smConfig = config.pet === "dino" || config.pet === "drago" ? {
      delays: {
        [STATES.WALK_RIGHT]: [3e3, 8e3],
        [STATES.WALK_LEFT]: [3e3, 8e3],
        [STATES.SLEEPING]: [4e3, 8e3]
      },
      transitions: {
        [STATES.WALK_RIGHT]: STATES.SLEEPING,
        [STATES.WALK_LEFT]: STATES.SLEEPING,
        [STATES.SLEEPING]: () => Math.random() > 0.5 ? STATES.WALK_RIGHT : STATES.WALK_LEFT
      }
    } : {};
    const sm = new StateMachine(smConfig);
    const renderer = createRenderer(config);
    let x = Math.random() * Math.max(0, window.innerWidth - 64);
    let running = true;
    let frameTimer = null;
    let frameIdx = 0;
    let currentAnimState = null;
    let currentFlip = false;
    function stopSheetAnim() {
      if (frameTimer) {
        clearInterval(frameTimer);
        frameTimer = null;
      }
    }
    function startSheetAnim(info, state, flip) {
      currentFlip = flip;
      if (currentAnimState === state)
        return;
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
      if (info.type === "sheet") {
        startSheetAnim(info, state, flip);
      } else {
        stopSheetAnim();
        currentAnimState = null;
        renderer.setSprite(info.url, flip, config.scale);
      }
    }
    renderer.getElement().querySelector("img").addEventListener("error", () => {
      running = false;
      stopSheetAnim();
      renderer.remove();
      sm.stop();
    });
    sm.setOnTransition((state) => applySprite(state));
    applySprite(STATES.WALK_RIGHT);
    renderer.setPosition(x);
    const clickDuration = config.pet === "drago" ? 3e3 : 800;
    if (config.pet !== "dino") {
      setupCursorTracking({
        getEl: () => renderer.getElement(),
        onPetClick: () => {
          sm.onClick();
          setTimeout(() => sm.onClickEnd(), clickDuration);
        }
      });
    }
    let lastTime = null;
    function loop(timestamp) {
      if (!running)
        return;
      if (lastTime === null)
        lastTime = timestamp;
      const dt = Math.min(timestamp - lastTime, 50);
      lastTime = timestamp;
      const state = sm.state;
      const vw = window.innerWidth;
      const pw = renderer.getWidth();
      const pxPerFrame = config.speed * dt / 16;
      if (state === STATES.WALK_RIGHT) {
        x = Math.min(x + pxPerFrame, vw - pw);
        if (x >= vw - pw)
          sm.onEdge("right");
      } else if (state === STATES.WALK_LEFT) {
        x = Math.max(x - pxPerFrame, 0);
        if (x <= 0)
          sm.onEdge("left");
      }
      renderer.setPosition(Math.round(x));
      requestAnimationFrame(loop);
    }
    sm.start();
    requestAnimationFrame(loop);
  }
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
