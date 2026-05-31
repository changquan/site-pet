# Site Pet Widget — Design Spec

**Date:** 2026-05-31  
**Status:** Approved

---

## Overview

An embeddable JavaScript widget that injects an animated pixel-art pet into any website. The pet walks, idles, sits, reacts to cursor proximity, and responds to clicks — inspired by the VS Code Pets extension. Site owners embed it with a single `<script>` tag and an optional config object.

---

## Supported Pets

Three pet types, all sourced from open-source MIT-licensed pixel art (VS Code Pets sprites are the primary candidate):

- `dino` (default)
- `cat`
- `dog`

---

## Behaviors

The pet runs a state machine with six states:

| State | Description |
|---|---|
| `walk-right` | Pet walks across the screen to the right |
| `walk-left` | Pet walks across the screen to the left |
| `idle` | Pet stands still with a breathing/blinking animation |
| `sitting` | Pet sits and rests |
| `follow-cursor` | Pet chases the mouse cursor position |
| `clicked` | Pet plays a reaction animation on click, then resumes |

**Autonomous transitions (random timer):** `walk-right`/`walk-left` → `idle` → `sitting` → walk again.

**Edge bounce:** When the pet reaches the left or right edge of the viewport, it flips direction.

**Cursor hover:** When the cursor comes within 100px of the pet, it switches to `follow-cursor`. When the cursor moves further away, it resumes autonomous behavior.

**Click:** Any state → `clicked` reaction animation → resume previous state.

---

## Rendering Architecture

**Approach: DOM div + CSS sprite sheet animation**

- `site-pet.js` injects a `position: fixed` div into the page on load.
- The pet's sprite sheet (PNG) is set as `background-image` on the div.
- Frame animation is achieved by stepping `background-position` across the sprite sheet at a fixed interval (e.g. 150ms/frame).
- Movement is applied by updating the `left` CSS property on each `requestAnimationFrame` tick.
- The pet is rendered at the bottom of the viewport, above a configurable floor offset.

No canvas, no external libraries, no build step required.

---

## Embed API

Drop at the bottom of `<body>`:

```html
<script src="site-pet.js"></script>
```

Optional config object placed *before* the script tag:

```html
<script>
  window.SitePetConfig = {
    pet: "dino",  // "cat" | "dog" | "dino"  (default: "dino")
    scale: 2,     // pixel scale multiplier   (default: 2)
    speed: 3,     // walk speed in px/frame   (default: 3)
    floor: 0,     // px from bottom of viewport (default: 0)
  };
</script>
<script src="site-pet.js"></script>
```

`site-pet.js` resolves sprite URLs relative to its own `<script src>` path, so it works regardless of where the files are hosted.

---

## File Structure

```
site-pet/
├── site-pet.js          # main embed script (single file, self-contained)
├── sprites/
│   ├── cat.png          # sprite sheet — walk, idle, sit, clicked frames
│   ├── dog.png
│   └── dino.png
└── demo/
    └── index.html       # local demo page for testing
```

---

## Sprite Sourcing

Sprites will be sourced from MIT-licensed open-source pixel art. The VS Code Pets extension (`https://github.com/tonybaloney/vscode-pets`) is the primary candidate — it already has cat, dog, and dino sprites purpose-built for this kind of use. Alternative sources (itch.io free pixel art packs) will be evaluated if VS Code Pets sprites are not suitable.

Each sprite sheet must include frames for: walk (left and right or flippable), idle, sitting, and clicked reaction.

---

## Error Handling

- If a sprite fails to load, the pet div is silently removed — no console errors thrown at the embedder.
- If `window.SitePetConfig` has unknown keys, they are ignored.
- If an invalid `pet` value is provided, falls back to `"cat"`.
