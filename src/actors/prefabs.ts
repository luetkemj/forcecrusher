import { type Entity } from "../ecs/engine";
import { DamageType, WeaponClass, OpenState } from "../ecs/enums";
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

const baseWeapon: Entity = {
  ...base,
  ...renderable,
  appearance: {
    char: chars.weapon,
    tint: colors.steel,
    tileSet: "ascii",
  },
  legendable: true,
  layer200: true,
  pickUp: true,
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
  damages: [],
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
  immunities: [],
  resistances: [],
  vulnerabilities: [],
  attacks: [
    {
      name: "Bite",
      verb: "bites",
      toHit: 0,
      attackType: "melee",
      damageRoll: "1d1",
      damageType: DamageType.Piercing,
      magical: false,
    },
    {
      name: "Claw",
      verb: "claws",
      toHit: 0,
      attackType: "melee",
      damageRoll: "1d1",
      damageType: DamageType.Slashing,
      magical: false,
    },
  ],
  damages: [],
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
  immunities: [DamageType.Poison],
  resistances: [DamageType.Piercing],
  vulnerabilities: [DamageType.Bludgeoning],
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
  damages: [],
  container: {
    name: "Haversack",
    description:
      "A simple medium sized burlap pouch with a single shoulder strap.",
    slots: 10,
    contents: [],
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
  ...baseWeapon,
  name: "Shortsword",
  description:
    "An unadorned steel shortsword. It won’t impress, but it gets the job done.",
  weaponClass: WeaponClass.Martial,
  attacks: [
    {
      name: "Stab",
      verb: "stabs",
      toHit: 0,
      attackType: "melee",
      damageRoll: "1d6+2",
      damageType: DamageType.Piercing,
      useModifier: true,
      magical: false,
    },
    {
      name: "Slash",
      verb: "slashes",
      toHit: 0,
      attackType: "melee",
      damageRoll: "1d6+2",
      damageType: DamageType.Slashing,
      useModifier: true,
      magical: false,
    },
    {
      name: "Bash",
      verb: "bashes",
      toHit: 0,
      attackType: "melee",
      damageRoll: "1d4+2",
      damageType: DamageType.Bludgeoning,
      useModifier: true,
      magical: false,
    },
  ],
};

// simple melee weapons
export const clubPrefab: Entity = {
  ...baseWeapon,
  name: "Club",
  description: "A crude bludgeon, little more than a knotted branch.",
  weaponClass: WeaponClass.Simple,
  appearance: {
    char: chars.weapon,
    tint: colors.wood,
    tileSet: "ascii",
  },
  attacks: [
    {
      name: "Smash",
      verb: "smashes",
      toHit: 0,
      attackType: "melee",
      damageRoll: "1d4",
      damageType: DamageType.Bludgeoning,
      useModifier: true,
      magical: false,
    },
  ],
};

export const daggerPrefab: Entity = {
  ...baseWeapon,
  name: "Dagger",
  description: "A rusted dagger with a chipped edge and a dark past.",
  weaponClass: WeaponClass.Simple,
  attacks: [
    {
      name: "Pummel",
      verb: "pummels",
      toHit: 0,
      attackType: "melee",
      damageRoll: "1d4",
      damageType: DamageType.Bludgeoning,
      magical: false,
    },
    {
      name: "Stab",
      verb: "stabs",
      toHit: 0,
      attackType: "melee",
      damageRoll: "1d4",
      damageType: DamageType.Piercing,
      useModifier: true,
      magical: false,
    },
    {
      name: "Slash",
      verb: "slashes",
      toHit: 0,
      attackType: "melee",
      damageRoll: "1d4",
      damageType: DamageType.Slashing,
      useModifier: true,
      magical: false,
    },
  ],
};

export const leatherArmor: Entity = {
  ...base,
  ...renderable,
  appearance: {
    char: chars.armor,
    tint: colors.leather,
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
export const doorPrefab: Entity = {
  ...base,
  ...renderable,
  ...tile,
  appearance: {
    char: chars.doorClosed,
    tint: colors.wood,
    tileSet: "ascii",
  },
  name: "door",
  legendable: true,
  description: "A door",
  layer200: true,
  opaque: true,
  blocking: true,
  door: true,
  openable: {
    state: OpenState.Closed,
  },
};

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
