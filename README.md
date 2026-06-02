# site-pet

A playful pixel-art pet that walks along the bottom of your website. Hover near it to make it follow your cursor, click it for a reaction.

## Pets

- **Dog** — the classic
- **Dino** — a little dinosaur
- **Dragon** (`drago`) — fancy

## Usage

Drop the built script into any page and set `SitePetConfig` before loading it:

```html
<script>
  window.SitePetConfig = { pet: 'dog', scale: 2, speed: 3, floor: 0 };
</script>
<script src="site-pet.js"></script>
```

### Config options

| Option  | Default | Description                          |
|---------|---------|--------------------------------------|
| `pet`   | `dog`   | Which pet: `dog`, `dino`, or `drago` |
| `scale` | `2`     | Sprite scale multiplier              |
| `speed` | `3`     | Walk speed                           |
| `floor` | `0`     | Pixels above the viewport bottom     |

## Dev

```bash
npm test          # run tests
npm run build     # bundle to site-pet.js
```

Open `demo/index.html` in a browser to try it out with all three pets.
