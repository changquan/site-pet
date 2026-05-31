const VALID_PETS = ['cat', 'dog', 'dino'];
const DEFAULTS = { pet: 'dino', scale: 2, speed: 3, floor: 0 };

export function parseConfig(raw = {}) {
  const pet = VALID_PETS.includes(raw.pet) ? raw.pet : DEFAULTS.pet;
  const scale = (typeof raw.scale === 'number' && raw.scale > 0) ? raw.scale : DEFAULTS.scale;
  const speed = (typeof raw.speed === 'number' && raw.speed > 0) ? raw.speed : DEFAULTS.speed;
  const floor = (typeof raw.floor === 'number') ? raw.floor : DEFAULTS.floor;
  return { pet, scale, speed, floor };
}
