(() => {
  var __create = Object.create;
  var __defProp = Object.defineProperty;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __getProtoOf = Object.getPrototypeOf;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __commonJS = (cb, mod) => function __require() {
    return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
    // If the importer is in node compatibility mode or this is not an ESM
    // file that has been converted to a CommonJS file using a Babel-
    // compatible transform (i.e. "__esModule" has not been set), then set
    // "default" to the CommonJS "module.exports" for node compatibility.
    isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
    mod
  ));

  // src/renderer.js
  var require_renderer = __commonJS({
    "src/renderer.js"(exports, module) {
      function createRenderer2({ floor, scale }) {
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
        container.appendChild(img);
        document.body.appendChild(container);
        return {
          setPosition(x) {
            container.style.left = `${x}px`;
          },
          setSprite(url, flip, currentScale) {
            img.src = url;
            const sc = currentScale || scale;
            img.style.transform = flip ? `scaleX(-1) scale(${sc})` : `scale(${sc})`;
            img.style.transformOrigin = "bottom left";
          },
          getElement() {
            return container;
          },
          getWidth() {
            return (img.naturalWidth || 32) * scale;
          },
          remove() {
            container.remove();
          }
        };
      }
      module.exports = { createRenderer: createRenderer2 };
    }
  });

  // src/config.js
  var VALID_PETS = ["dog"];
  var DEFAULTS = { pet: "dog", scale: 2, speed: 3, floor: 0 };
  function parseConfig(raw = {}) {
    const pet = VALID_PETS.includes(raw.pet) ? raw.pet : DEFAULTS.pet;
    const scale = typeof raw.scale === "number" && raw.scale > 0 ? raw.scale : DEFAULTS.scale;
    const speed = typeof raw.speed === "number" && raw.speed > 0 ? raw.speed : DEFAULTS.speed;
    const floor = typeof raw.floor === "number" ? raw.floor : DEFAULTS.floor;
    return { pet, scale, speed, floor };
  }

  // src/sprites.js
  var STATE_TO_FILE = {
    "walk-right": { file: "walk.gif", flip: false },
    "walk-left": { file: "walk.gif", flip: true },
    "idle": { file: "idle.gif", flip: false },
    "sitting": { file: "sit.gif", flip: false },
    "follow-cursor": { file: "walk.gif", flip: false },
    "clicked": { file: "click.gif", flip: false }
  };
  var FALLBACK = { file: "idle.gif", flip: false };
  function getSpriteUrl(pet, state, base) {
    const { file, flip } = STATE_TO_FILE[state] || FALLBACK;
    return { url: `${base}sprites/${pet}/${file}`, flip };
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
    FOLLOW_CURSOR: "follow-cursor",
    CLICKED: "clicked"
  };
  function randomBetween(min, max) {
    return Math.floor(Math.random() * (max - min)) + min;
  }
  var StateMachine = class {
    constructor() {
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
      const delays = {
        [STATES.WALK_RIGHT]: randomBetween(3e3, 8e3),
        [STATES.WALK_LEFT]: randomBetween(3e3, 8e3),
        [STATES.IDLE]: randomBetween(2e3, 4e3),
        [STATES.SITTING]: randomBetween(2e3, 5e3)
      };
      const delay = delays[this.state] ?? 3e3;
      this._timer = setTimeout(() => this._autonomousTransition(), delay);
    }
    _autonomousTransition() {
      const next = {
        [STATES.WALK_RIGHT]: STATES.IDLE,
        [STATES.WALK_LEFT]: STATES.IDLE,
        [STATES.IDLE]: STATES.SITTING,
        [STATES.SITTING]: Math.random() > 0.5 ? STATES.WALK_RIGHT : STATES.WALK_LEFT
      }[this.state] || STATES.WALK_RIGHT;
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
    onCursorNear() {
      if (this.state === STATES.CLICKED)
        return;
      if (this.state !== STATES.FOLLOW_CURSOR) {
        this._transition(STATES.FOLLOW_CURSOR);
      }
    }
    onCursorFar() {
      if (this.state === STATES.FOLLOW_CURSOR) {
        this.stop();
        this._transition(this._preInterruptState);
        this._scheduleNext();
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

  // src/index.js
  var import_renderer = __toESM(require_renderer());

  // src/cursor.js
  function isNear(el, cursorX, cursorY, threshold = 100) {
    const rect = el.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const dx = cursorX - cx;
    const dy = cursorY - cy;
    return dx * dx + dy * dy < threshold * threshold;
  }
  function cursorDirection(el, cursorX) {
    const rect = el.getBoundingClientRect();
    return cursorX >= rect.left + rect.width / 2 ? "right" : "left";
  }
  function setupCursorTracking({ getEl, onNear, onFar, onPetClick }) {
    let cursorX = -9999;
    let cursorY = -9999;
    let near = false;
    function handleMove(e) {
      cursorX = e.clientX;
      cursorY = e.clientY;
      const nowNear = isNear(getEl(), cursorX, cursorY);
      if (nowNear && !near) {
        near = true;
        onNear();
      }
      if (!nowNear && near) {
        near = false;
        onFar();
      }
    }
    function handleClick(e) {
      if (isNear(getEl(), e.clientX, e.clientY, 50))
        onPetClick();
    }
    document.addEventListener("mousemove", handleMove);
    document.addEventListener("click", handleClick);
    return {
      getCursorX: () => cursorX,
      teardown() {
        document.removeEventListener("mousemove", handleMove);
        document.removeEventListener("click", handleClick);
      }
    };
  }

  // src/index.js
  function init() {
    const config = parseConfig(window.SitePetConfig);
    const base = getScriptBase();
    const sm = new StateMachine();
    const renderer = (0, import_renderer.createRenderer)(config);
    let x = Math.random() * Math.max(0, window.innerWidth - 64);
    let running = true;
    function applySprite(state) {
      const { url, flip: baseFlip } = getSpriteUrl(config.pet, state, base);
      let flip = baseFlip;
      if (state === STATES.FOLLOW_CURSOR) {
        flip = cursorDirection(renderer.getElement(), cursor.getCursorX()) === "left";
      }
      renderer.setSprite(url, flip, config.scale);
    }
    renderer.getElement().querySelector("img").addEventListener("error", () => {
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
      onFar: () => sm.onCursorFar(),
      onPetClick: () => {
        sm.onClick();
        setTimeout(() => sm.onClickEnd(), 800);
      }
    });
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
      } else if (state === STATES.FOLLOW_CURSOR) {
        const target = cursor.getCursorX() - pw / 2;
        const diff = target - x;
        x += Math.sign(diff) * Math.min(Math.abs(diff), config.speed * 2 * dt / 16);
        x = Math.max(0, Math.min(x, vw - pw));
        applySprite(state);
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
