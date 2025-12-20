import { EntityId, Memory, type Entity } from "../ecs/engine";
import {
  DamageType,
  WeaponClass,
  OpenState,
  EffectType,
  EntityKind,
  Material,
} from "../ecs/enums";
import { colors, chars } from "./graphics";

const fluidContainerComponent = {
  open: true,
  fluids: {
    water: {
      type: "water",
      tint: colors.water,
      viscosity: 0.23,
      minFlow: 0.23,
      volume: 0,
      maxVolume: 10,
    },
    blood: {
      type: "blood",
      tint: colors.blood,
      viscosity: 0.18,
      minFlow: 0.5,
      volume: 0,
      maxVolume: 10,
    },
    oil: {
      type: "oil",
      tint: colors.oil,
      viscosity: 0.15,
      minFlow: 0.7,
      volume: 0,
      maxVolume: 10,
    },
    lava: {
      type: "lava",
      tint: colors.lava,
      viscosity: 0.01,
      minFlow: 1,
      volume: 0,
      maxVolume: 10,
    },
  },
};

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
    tileSet: "kenny",
  },
  position: { x: 0, y: 0 },
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
  vision: { range: 10, visible: [] },
  memory: { memories: new Map<EntityId, Memory>() },
  odor: {
    strength: 10,
  },
};

const baseWeapon: Entity = {
  ...base,
  ...renderable,
  appearance: {
    char: chars.weapon,
    tint: colors.steel,
    tileSet: "kenny",
  },
  legendable: true,
  layer200: true,
  pickUp: true,
};

// NOTE: Player
export const playerPrefab: Entity = {
  ...renderable,
  ...being,
  desiccate: { range: 0, rate: 0.2, absorb: true },
  odor: {
    strength: 10,
  },
  entityKind: EntityKind.Player,
  appearance: {
    char: chars.player,
    tint: colors.player,
    tileSet: "kenny",
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
  immunities: [DamageType.Fire],
  attacks: [
    {
      name: "Kick",
      verb: "kicks",
      toHit: 0,
      attackType: "melee",
      damageRoll: "1d1",
      damageType: DamageType.Bludgeoning,
      natural: true,
      knockbackDistance: 2,
    },
  ],
  pathThrough: true,
  mass: 1,
  material: Material.Flesh,
};

// NOTE: Actors / Creatures
export const ratPrefab: Entity = {
  ...base,
  ...renderable,
  ...being,
  entityKind: EntityKind.Beast,
  ai: true,
  appearance: {
    char: chars.rat,
    tint: colors.rat,
    tileSet: "kenny",
  },
  legendable: true,
  name: "rat",
  nose: { sensitivity: 0, detected: [] },
  ears: { sensitivity: 0, detected: [] },
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
    },
    {
      name: "Claw",
      verb: "claws",
      toHit: 0,
      attackType: "melee",
      damageRoll: "1d1",
      damageType: DamageType.Slashing,
    },
  ],
  damages: [],
  kickable: {
    breakable: true,
    noiseLevel: 2,
    maxDamageOnKick: 2,
  },
  vision: { range: 3, visible: [] },
  mass: 0.8,
  material: Material.Flesh,
};

export const lavaGolemPrefab: Entity = {
  ...base,
  ...renderable,
  ...being,
  entityKind: EntityKind.Humanoid,
  ai: true,
  appearance: {
    char: chars.golem,
    tint: colors.lava,
    tileSet: "kenny",
  },
  legendable: true,
  name: "lava golem",
  ears: { sensitivity: 3, detected: [] },
  nose: { sensitivity: 0, detected: [] },
  description: "A humanoid mass of lava, animated by forgotten magic.",
  pathThrough: true,
  health: { max: 15, current: 15 },
  baseArmorClass: 10,
  strength: 10,
  dexterity: 14,
  constitution: 15,
  intelligence: 6,
  wisdom: 8,
  charisma: 5,
  immunities: [DamageType.Fire, DamageType.Poison, DamageType.Acid],
  resistances: [DamageType.Bludgeoning, DamageType.Piercing],
  vulnerabilities: [DamageType.Cold],
  attacks: [
    {
      name: "Lava Punch",
      verb: "punches",
      toHit: 0,
      attackType: "melee",
      damageRoll: "1d6",
      damageType: DamageType.Fire,
    },
  ],
  damages: [],
  mass: 6,
  material: Material.Lava,
};

export const skeletonPrefab: Entity = {
  ...base,
  ...renderable,
  ...being,
  entityKind: EntityKind.Undead,
  ai: true,
  appearance: {
    char: chars.skeleton,
    tint: colors.skeleton,
    tileSet: "kenny",
  },
  legendable: true,
  name: "skeleton",
  ears: { sensitivity: 5, detected: [] },
  nose: { sensitivity: 5, detected: [] },
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
  mass: 6,
  material: Material.Bone,
};

// NOTE: Potions
export const healthPotionPrefab: Entity = {
  ...base,
  ...renderable,
  appearance: {
    char: chars.potion,
    tint: colors.potion,
    tileSet: "kenny",
  },
  consumable: true,
  legendable: true,
  name: "Health Potion",
  description: "A syrupy red liquid in a small glass vile",
  effects: [{ component: "health", delta: 10 }],
  layer200: true,
  pickUp: true,
  mass: 0.8,
  material: Material.Glass,
};

export const bottlePrefab: Entity = {
  ...base,
  ...renderable,
  appearance: {
    char: chars.bottleEmpty,
    tint: colors.glass,
    tileSet: "kenny",
  },
  legendable: true,
  name: "Empty Bottle",
  description: "An empty glass bottle",
  layer200: true,
  pickUp: true,
  mass: 0.8,
  material: Material.Glass,
  fluidContainer: { ...fluidContainerComponent },
};

// NOTE: Items
export const rockPrefab: Entity = {
  ...base,
  ...renderable,
  appearance: {
    char: chars.rock,
    tint: colors.rock,
    tileSet: "kenny",
  },
  legendable: true,
  name: "Rock",
  description: "A small, jagged stone—barely useful, unless thrown.",
  layer200: true,
  pickUp: true,
  kickable: {
    noiseLevel: 3,
    breakable: true,
  },
  mass: 1,
  material: Material.Stone,
};

// NOTE: Weapons
export const shortswordPrefab: Entity = {
  ...baseWeapon,
  name: "Shortsword",
  description:
    "An unadorned steel shortsword. It won’t impress, but it gets the job done.",
  appearance: {
    char: chars.shortsword,
    tint: colors.steel,
    tileSet: "kenny",
  },
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
    },
    {
      name: "Slash",
      verb: "slashes",
      toHit: 0,
      attackType: "melee",
      damageRoll: "1d6+2",
      damageType: DamageType.Slashing,
      useModifier: true,
    },
    {
      name: "Bash",
      verb: "bashes",
      toHit: 0,
      attackType: "melee",
      damageRoll: "1d4+2",
      damageType: DamageType.Bludgeoning,
      useModifier: true,
    },
  ],
  mass: 1.5,
  material: Material.Metal,
};

// simple melee weapons
export const clubPrefab: Entity = {
  ...baseWeapon,
  name: "Club",
  description: "A crude bludgeon, little more than a knotted branch.",
  weaponClass: WeaponClass.Simple,
  appearance: {
    char: chars.club,
    tint: colors.wood,
    tileSet: "kenny",
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
      knockbackDistance: 2,
    },
  ],
  mass: 2,
  material: Material.Wood,
};

export const daggerPrefab: Entity = {
  ...baseWeapon,
  name: "Dagger",
  description: "A rusted dagger with a chipped edge and a dark past.",
  appearance: {
    char: chars.dagger,
    tint: colors.wood,
    tileSet: "kenny",
  },
  weaponClass: WeaponClass.Simple,
  attacks: [
    {
      name: "Pummel",
      verb: "pummels",
      toHit: 0,
      attackType: "melee",
      damageRoll: "1d4",
      damageType: DamageType.Bludgeoning,
    },
    {
      name: "Stab",
      verb: "stabs",
      toHit: 0,
      attackType: "melee",
      damageRoll: "1d4",
      damageType: DamageType.Piercing,
      useModifier: true,
    },
    {
      name: "Slash",
      verb: "slashes",
      toHit: 0,
      attackType: "melee",
      damageRoll: "1d4",
      damageType: DamageType.Slashing,
      useModifier: true,
    },
  ],
  mass: 0.8,
  material: Material.Metal,
};

export const leatherArmor: Entity = {
  ...base,
  ...renderable,
  appearance: {
    char: chars.armor,
    tint: colors.leather,
    tileSet: "kenny",
  },
  legendable: true,
  name: "Leather Armor",
  description: "Basic but reliable, bearing the wear of many fights.",
  layer200: true,
  pickUp: true,
  armorClass: 11,
  armorClassMod: "dexterity",
  mass: 2.5,
  material: Material.Leather,
};

// NOTE: Interactive Structures
export const doorPrefab: Entity = {
  ...base,
  ...renderable,
  ...tile,
  appearance: {
    char: chars.doorClosed,
    tint: colors.wood,
    tileSet: "kenny",
  },
  name: "door",
  legendable: true,
  description: "A door",
  layer250: true,
  opaque: true,
  pathThrough: true,
  blocking: true,
  door: true,
  openable: {
    state: OpenState.Closed,
  },
  kickable: {
    knockbackDistance: 0,
    immovable: true,
    breakable: true,
    noiseLevel: 100,
    maxDamageOnKick: 2,
  },
  health: {
    max: 25,
    current: 25,
  },
  vulnerabilities: [DamageType.Bludgeoning, DamageType.Force],
  resistances: [DamageType.Piercing],
  immunities: [DamageType.Poison, DamageType.Psychic],
  effectImmunities: [EffectType.Knockback],
  baseArmorClass: 1,
  damages: [],
  mass: 10,
  material: Material.Wood,
};

export const stairsDownPrefab: Entity = {
  ...base,
  ...renderable,
  ...tile,
  appearance: {
    char: chars.stairsDown,
    tint: colors.stairsDown,
    tileSet: "kenny",
  },
  name: "stairs down",
  stairsDown: true,
  legendable: true,
  description: "Stairs leading down",
  layer250: true,
  mass: 10,
  material: Material.Wood,
};

export const stairsUpPrefab: Entity = {
  ...base,
  ...renderable,
  ...tile,
  appearance: {
    char: chars.stairsUp,
    tint: colors.stairsUp,
    tileSet: "kenny",
  },
  name: "stairs up",
  stairsUp: true,
  legendable: true,
  description: "Stairs leading up",
  layer250: true,
  mass: 10,
  material: Material.Wood,
};

// NOTE: Terrain / Map Features
export const wallPrefab: Entity = {
  ...base,
  ...renderable,
  ...tile,
  appearance: {
    char: chars.wall,
    tint: colors.wall,
    tileSet: "kenny",
  },
  blocking: true,
  opaque: true,
  name: "wall",
  kickable: {
    knockbackDistance: 0,
    immovable: true,
    maxDamageOnKick: 2,
    noiseLevel: 5,
  },
  mass: 100,
  material: Material.Stone,
};

export const floorPrefab: Entity = {
  ...base,
  ...renderable,
  ...tile,
  appearance: {
    char: chars.floor,
    tint: colors.floor,
    tileSet: "kenny",
  },
  name: "floor",
  mass: 100,
  material: Material.Stone,
};

export const fluidContainerPrefab: Entity = {
  ...base,
  ...renderable,
  name: "fluidContainer",
  layer150: true,
  appearance: {
    char: "",
    tint: 0x000,
    tileSet: "kenny",
  },
  mass: 0,
  fluidContainer: { ...fluidContainerComponent },
};

export const grassPrefab: Entity = {
  ...base,
  ...renderable,
  ...tile,
  appearance: {
    char: chars.grass,
    tint: colors.plant,
    tileSet: "kenny",
  },
  name: "grass",
  description: "Dry grass",
  layer125: true,
  mass: 0.4,
  material: Material.Plant,
  pickUp: true,
  mutable: {
    current: "young",
    mutations: [
      {
        next: "young",
        name: "burnt",
        chanceToMutate: 0.01,
        addComponents: {
          appearance: {
            char: chars.grass,
            tint: colors.ash,
            tileSet: "kenny",
          },
        },
        removeComponents: ["flammable"],
      },
      {
        next: "mature",
        name: "young",
        chanceToMutate: 0.00025,
        addComponents: {
          appearance: {
            char: chars.grass,
            tint: colors.plant,
            tileSet: "kenny",
          },
          calculateFlammability: true,
        },
        removeComponents: [],
      },
      {
        name: "mature",
        chanceToMutate: 0.01,
        addComponents: {
          appearance: {
            char: chars.tallGrass,
            tint: colors.plant,
            tileSet: "kenny",
          },
          calculateFlammability: true,
        },
        removeComponents: [],
      },
    ],
  },
};
