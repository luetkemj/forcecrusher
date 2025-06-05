import { type Entity } from "../ecs/engine";
import { DamageType, WeaponClass, WeaponType } from "../ecs/enums";
import { colors, chars } from "./graphics";

// NOTE: generics
const base: Entity = {
  id: "",
  version: 1,
  name: "base",
};

const renderable: Entity = {
  ...base,
  appearance: {
    char: chars.default,
    tint: colors.default,
    tileSet: "ascii",
  },
  position: { x: 0, y: 0, z: 0 },
  name: "renderable",
};

const tile: Entity = {
  ...base,
  layer100: true,
  name: "tile",
};

const being: Entity = {
  ...base,
  health: { max: 1, current: 1 },
  blocking: true,
  layer300: true,
  name: "being",
  baseArmorClass: 10,
  averageDamage: 0,
  strength: 10,
  dexterity: 10,
  constitution: 10,
  intelligence: 10,
  wisdom: 10,
  charisma: 10,
};

// NOTE: Player
export const playerPrefab: Entity = {
  ...renderable,
  ...being,
  appearance: {
    char: chars.player,
    tint: colors.player,
    tileSet: "ascii",
  },
  health: { max: 1000, current: 1000 },
  legendable: true,
  name: "player",
  pc: true,
  container: {
    name: "Haversack",
    description:
      "A simple medium sized burlap pouch with a single shoulder strap.",
    slots: 10,
    contents: [],
  },
  baseArmorClass: 10,
  strength: 16,
  dexterity: 10,
  constitution: 16,
  intelligence: 8,
  wisdom: 14,
  charisma: 10,
  activeEffects: [],
  weaponSlot: {
    name: "Weapon",
    contents: [],
    slots: 1,
  },
  armorSlot: {
    name: "Armor",
    contents: [],
    slots: 1,
  },
};

// NOTE: Actors / Creatures
export const ratPrefab: Entity = {
  ...base,
  ...renderable,
  ...being,
  ai: true,
  appearance: {
    char: chars.rat,
    tint: colors.rat,
    tileSet: "ascii",
  },
  legendable: true,
  name: "rat",
  description:
    "A filthy, disease-ridden rodent with glowing eyes and a hungry squeak.",
  pathThrough: true,
  health: { max: 1, current: 1 },
  baseArmorClass: 10,
  strength: 2,
  dexterity: 11,
  constitution: 9,
  intelligence: 2,
  wisdom: 10,
  charisma: 4,
};

export const skeletonPrefab: Entity = {
  ...base,
  ...renderable,
  ...being,
  ai: true,
  appearance: {
    char: chars.skeleton,
    tint: colors.skeleton,
    tileSet: "ascii",
  },
  legendable: true,
  name: "skeleton",
  description:
    "A brittle warrior from another age, still fighting long after death forgot it.",
  pathThrough: true,
  health: { max: 13, current: 13 },
  baseArmorClass: 10,
  strength: 10,
  dexterity: 14,
  constitution: 15,
  intelligence: 6,
  wisdom: 8,
  charisma: 5,
  weaponSlot: {
    name: "Weapon",
    contents: [],
    slots: 1,
  },
  armorSlot: {
    name: "Armor",
    contents: [],
    slots: 1,
  },
};

// NOTE: Potions
export const healthPotionPrefab: Entity = {
  ...base,
  ...renderable,
  appearance: {
    char: chars.potion,
    tint: colors.potion,
    tileSet: "ascii",
  },
  consumable: true,
  legendable: true,
  name: "Health Potion",
  description: "A syrupy red liquid in a small glass vile",
  effects: [{ component: "health", delta: 10 }],
  layer200: true,
  pickUp: true,
};

// NOTE: Items
export const rockPrefab: Entity = {
  ...base,
  ...renderable,
  appearance: {
    char: chars.rock,
    tint: colors.rock,
    tileSet: "ascii",
  },
  legendable: true,
  name: "Rock",
  description: "A small, jagged stone—barely useful, unless thrown.",
  layer200: true,
  pickUp: true,
};

// NOTE: Weapons
export const shortswordPrefab: Entity = {
  ...base,
  ...renderable,
  appearance: {
    char: chars.weapon,
    tint: colors.weapon,
    tileSet: "ascii",
  },
  legendable: true,
  name: "Shortsword",
  description:
    "An unadorned steel shortsword. It won’t impress, but it gets the job done.",
  layer200: true,
  pickUp: true,
  damageType: DamageType.Piercing,
  damageRoll: "1d6+2",
  weaponClass: WeaponClass.Martial,
  weaponType: WeaponType.Melee,
};

export const leatherArmor: Entity = {
  ...base,
  ...renderable,
  appearance: {
    char: chars.armor,
    tint: colors.armor,
    tileSet: "ascii",
  },
  legendable: true,
  name: "Leather Armor",
  description: "Basic but reliable, bearing the wear of many fights.",
  layer200: true,
  pickUp: true,
  armorClass: 11,
  armorClassMod: "dexterity",
};

// NOTE: Interactive Structures
export const stairsDownPrefab: Entity = {
  ...base,
  ...renderable,
  ...tile,
  appearance: {
    char: chars.stairsDown,
    tint: colors.stairsDown,
    tileSet: "ascii",
  },
  name: "stairs down",
  stairsDown: true,
  legendable: true,
  description: "Stairs leading down",
  layer200: true,
};

export const stairsUpPrefab: Entity = {
  ...base,
  ...renderable,
  ...tile,
  appearance: {
    char: chars.stairsUp,
    tint: colors.stairsUp,
    tileSet: "ascii",
  },
  name: "stairs up",
  stairsUp: true,
  legendable: true,
  description: "Stairs leading up",
  layer200: true,
};

// NOTE: Terrain / Map Features
export const wallPrefab: Entity = {
  ...base,
  ...renderable,
  ...tile,
  appearance: {
    char: chars.wall,
    tint: colors.wall,
    tileSet: "ascii",
  },
  blocking: true,
  opaque: true,
  name: "wall",
};

export const floorPrefab: Entity = {
  ...base,
  ...renderable,
  ...tile,
  appearance: {
    char: chars.floor,
    tint: colors.floor,
    tileSet: "ascii",
  },
  name: "floor",
};
