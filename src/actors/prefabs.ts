import attacks from "../attacks";
import { EntityId, Memory, type Entity } from "../ecs/engine";
import {
  DamageType,
  WeaponClass,
  OpenState,
  EffectType,
  EntityKind,
  Material,
  Fluids,
  ReadableType,
  TileSet,
} from "../ecs/enums";
import { createBlood } from "../spells/spellbook/createBlood";
import { createWater } from "../spells/spellbook/createWater";
import { desiccate } from "../spells/spellbook/desiccate";
import { ignite } from "../spells/spellbook/ignite";
import { kill } from "../spells/spellbook/kill";
import { knock } from "../spells/spellbook/knock";
import { massKill } from "../spells/spellbook/massKill";
import { colors, chars } from "./graphics";

export const fluidContainerComponent = {
  corked: false,
  maxVolume: 10,
  inflow: true,
  outflow: true,
  fluids: {
    water: {
      type: Fluids.Water,
      tint: colors.water,
      viscosity: 0.23,
      minFlow: 0.23,
      volume: 0,
    },
    blood: {
      type: Fluids.Blood,
      tint: colors.blood,
      viscosity: 0.18,
      minFlow: 0.5,
      volume: 0,
    },
    oil: {
      type: Fluids.Oil,
      tint: colors.oil,
      viscosity: 0.15,
      minFlow: 0.7,
      volume: 0,
    },
    lava: {
      type: Fluids.Lava,
      tint: colors.lava,
      viscosity: 0.01,
      minFlow: 1,
      volume: 0,
    },
  },
};

const wetComponent = {
  wet: {
    fluids: {
      blood: { level: 0, tint: colors.blood },
      lava: { level: 0, tint: colors.lava },
      oil: { level: 0, tint: colors.oil },
      water: { level: 0, tint: colors.water },
    },
  },
};

// NOTE: generics
const base: Entity = {
  id: "",
  version: 1,
  name: "base",
};

const baseRenderable: Entity = {
  ...base,
  appearance: {
    char: chars.default,
    tint: colors.default,
    tileSet: TileSet.Kenny,
  },
  position: { x: 0, y: 0 },
  name: "renderable",
  ...wetComponent,
};

const baseTile: Entity = {
  ...baseRenderable,
  layer100: true,
  name: "tile",
};

const baseBeing: Entity = {
  ...baseRenderable,
  health: { max: 1, current: 1 },
  living: true,
  blocking: true,
  pathThrough: true,
  layer300: true,
  name: "being",
  legendable: true,
  baseArmorClass: 10,
  averageDamage: 0,
  strength: 16,
  dexterity: 10,
  constitution: 12,
  intelligence: 10,
  wisdom: 10,
  charisma: 10,
  vision: { range: 10, visible: [] },
  memory: { memories: new Map<EntityId, Memory>() },
  odor: {
    strength: 10,
  },
};

const baseMob: Entity = {
  ...baseBeing,
  ai: true,
};

const baseItem: Entity = {
  ...baseRenderable,
  layer200: true,
  pickUp: true,
};

const baseWeapon: Entity = {
  ...baseItem,
  appearance: {
    char: chars.weapon,
    tint: colors.steel,
    tileSet: TileSet.Kenny,
  },
};

// NOTE: Player
export const playerPrefab: Entity = {
  ...baseBeing,
  odor: {
    strength: 10,
  },
  entityKind: EntityKind.Player,
  appearance: {
    char: chars.player,
    tint: colors.player,
    tileSet: TileSet.Kenny,
  },
  coinPurse: { value: 0 },
  health: { max: 30, current: 30 },
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
  attacks: [attacks.melee.kick()],
  pathThrough: true,
  mass: 1,
  material: Material.Flesh,
  knownSpells: [
    ignite,
    createWater,
    createBlood,
    desiccate,
    kill,
    massKill,
    knock,
  ],
  vitalFluid: Fluids.Blood,
};

// NOTE: Actors / Creatures
export const ratPrefab: Entity = {
  ...baseMob,
  entityKind: EntityKind.Beast,
  appearance: {
    char: chars.mobRat,
    tint: colors.rat,
    tileSet: TileSet.Kenny,
  },
  name: "rat",
  nose: { sensitivity: 0, detected: [] },
  ears: { sensitivity: 0, detected: [] },
  vision: { range: 3, visible: [] },
  description:
    "A filthy, disease-ridden rodent with glowing eyes and a hungry squeak.",
  health: { max: 5, current: 5 },
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
    attacks.melee.bite({ useModifier: undefined }),
    attacks.melee.claw({ useModifier: undefined }),
  ],
  damages: [],
  kickable: {
    breakable: true,
    noiseLevel: 2,
    maxDamageOnKick: 2,
  },
  mass: 0.8,
  material: Material.Flesh,
  vitalFluid: Fluids.Blood,
};

export const lavaGolemPrefab: Entity = {
  ...baseMob,
  entityKind: EntityKind.Humanoid,
  appearance: {
    char: chars.mobGolem,
    tint: colors.lava,
    tileSet: TileSet.Kenny,
  },
  name: "lava golem",
  ears: { sensitivity: 3, detected: [] },
  nose: { sensitivity: 0, detected: [] },
  vision: { range: 5, visible: [] },
  description: "A humanoid mass of lava, animated by forgotten magic.",
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
  attacks: [attacks.melee.lavaPunch()],
  damages: [],
  mass: 6,
  material: Material.Lava,
  fluidContainer: {
    corked: true,
    maxVolume: 10,
    outflow: true,
    inflow: false,
    fluids: {
      lava: {
        ...fluidContainerComponent.fluids.lava,
        volume: 8,
      },
    },
  },
  vitalFluid: Fluids.Lava,
};

export const livingSpongePrefab: Entity = {
  ...baseMob,
  entityKind: EntityKind.Beast,
  appearance: {
    char: chars.mobSponge,
    tint: colors.paper,
    tileSet: TileSet.Kenny,
  },
  name: "Living Sponge",
  ears: { sensitivity: 0, detected: [] },
  nose: { sensitivity: 0, detected: [] },
  vision: { range: 5, visible: [] },
  description: "A living sponge with an unquenchable thirst",
  health: { max: 10, current: 10 },
  baseArmorClass: 10,
  strength: 10,
  dexterity: 14,
  constitution: 15,
  intelligence: 6,
  wisdom: 8,
  charisma: 5,
  immunities: [DamageType.Fire],
  resistances: [],
  vulnerabilities: [],
  attacks: [],
  damages: [],
  mass: 6,
  material: Material.Paper,
  desiccate: {
    range: 1,
    rate: 0.5,
    absorb: true,
    allowList: [],
    denyList: [],
  },
  fluidContainer: {
    ...fluidContainerComponent,
    corked: true,
    maxVolume: 4,
    inflow: false,
    outflow: true,
  },
  renderFluidColor: true,
};

export const goblinPrefab: Entity = {
  ...baseMob,
  entityKind: EntityKind.Humanoid,
  appearance: {
    char: chars.mobGoblin,
    tint: colors.mobGoblin,
    tileSet: TileSet.Kenny,
  },
  name: "goblin",
  ears: { sensitivity: 3, detected: [] },
  nose: { sensitivity: 3, detected: [] },
  vision: { range: 5, visible: [] },
  description: "Snarling spittin little brutes. Dumb as rocks.",
  health: { max: 15, current: 15 },
  baseArmorClass: 10,
  strength: 10,
  dexterity: 14,
  constitution: 13,
  intelligence: 4,
  wisdom: 5,
  charisma: 5,
  immunities: [],
  resistances: [],
  vulnerabilities: [],
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
  attacks: [
    attacks.melee.bite(),
    attacks.melee.claw(),
    attacks.melee.kick({ knockbackDistance: undefined }),
  ],
  damages: [],
  container: {
    name: "Haversack",
    description:
      "A simple medium sized burlap pouch with a single shoulder strap.",
    slots: 3,
    contents: [],
  },
  mass: 6,
  material: Material.Flesh,
  vitalFluid: Fluids.Blood,
};

export const owlbearPrefab: Entity = {
  ...baseMob,
  entityKind: EntityKind.Beast,
  appearance: {
    char: chars.mobOwlbear,
    tint: colors.wood,
    tileSet: TileSet.Kenny,
  },
  name: "owlbear",
  ears: { sensitivity: 7, detected: [] },
  nose: { sensitivity: 0, detected: [] },
  vision: { range: 20, visible: [] },
  description: "Bird? Beast? All killing machine.",
  health: { max: 35, current: 35 },
  baseArmorClass: 10,
  strength: 18,
  dexterity: 10,
  constitution: 15,
  intelligence: 6,
  wisdom: 18,
  charisma: 5,
  immunities: [],
  resistances: [],
  vulnerabilities: [],
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
  attacks: [attacks.melee.beak(), attacks.melee.claw({ damageRoll: "1d6" })],
  damages: [],
  mass: 18,
  material: Material.Flesh,
};

export const ogrePrefab: Entity = {
  ...baseMob,
  entityKind: EntityKind.Humanoid,
  appearance: {
    char: chars.mobOgre,
    tint: colors.flesh,
    tileSet: TileSet.Kenny,
  },
  name: "ogre",
  ears: { sensitivity: 5, detected: [] },
  nose: { sensitivity: 5, detected: [] },
  vision: { range: 5, visible: [] },
  description: "A hulking mass of meat. Angry meat.",
  health: { max: 30, current: 30 },
  baseArmorClass: 10,
  strength: 10,
  dexterity: 14,
  constitution: 15,
  intelligence: 6,
  wisdom: 8,
  charisma: 5,
  immunities: [],
  resistances: [],
  vulnerabilities: [],
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
  attacks: [attacks.melee.bash(), attacks.melee.stomp()],
  damages: [],
  container: {
    name: "Haversack",
    description:
      "A simple medium sized burlap pouch with a single shoulder strap.",
    slots: 10,
    contents: [],
  },
  mass: 20,
  material: Material.Flesh,
};

export const skeletonPrefab: Entity = {
  ...baseMob,
  entityKind: EntityKind.Undead,
  appearance: {
    char: chars.mobSkeleton,
    tint: colors.skeleton,
    tileSet: TileSet.Kenny,
  },
  name: "skeleton",
  ears: { sensitivity: 5, detected: [] },
  nose: { sensitivity: 5, detected: [] },
  description:
    "A brittle warrior from another age, still fighting long after death forgot it.",
  health: { max: 10, current: 10 },
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
  attacks: [attacks.melee.claw()],
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

// spellBooks
export const spellbookPrefab: Entity = {
  ...baseItem,
  appearance: {
    char: chars.spellbook,
    tint: colors.paper,
    tileSet: TileSet.Kenny,
  },
  readable: { type: ReadableType.Spellbook, message: "" },
  name: "Spellbook",
  description:
    "A tome filled with glyphs and rituals. Read it to learn a spell.",
  mass: 1.5,
  material: Material.Paper,
};

// spellscrolls
export const spellscrollPrefab: Entity = {
  ...baseItem,
  appearance: {
    char: chars.spellscroll,
    tint: colors.paper,
    tileSet: TileSet.Kenny,
  },
  readable: { type: ReadableType.Scroll, message: "" },
  name: "Spellscroll",
  description:
    "Weather paper adorned with glowing runes. Read it to cast a spell.",
  mass: 1.5,
  material: Material.Paper,
};

// NOTE: Potions
export const healthPotionPrefab: Entity = {
  ...baseItem,
  appearance: {
    char: chars.potion,
    tint: colors.potion,
    tileSet: TileSet.Kenny,
  },
  consumable: true,
  name: "Health Potion",
  description: "A syrupy red liquid in a small glass vile",
  readable: { type: ReadableType.Text, message: "Drink me" },
  effects: [{ component: "health", delta: 10 }],
  mass: 0.8,
  material: Material.Glass,
};

export const bottlePrefab: Entity = {
  ...baseItem,
  appearance: {
    char: chars.bottleEmpty,
    tint: colors.glass,
    tileSet: TileSet.Kenny,
  },
  name: "Bottle",
  description: "An empty glass bottle",
  mass: 0.8,
  material: Material.Glass,
  fluidContainer: {
    ...fluidContainerComponent,
    corked: true,
    inflow: false,
    outflow: false,
  },
  mutable: {
    current: "empty",
    mutations: [
      {
        name: "empty",
        chanceToMutate: 0,
        addComponents: {
          appearance: {
            char: chars.bottleEmpty,
            tint: colors.glass,
            tileSet: TileSet.Kenny,
          },
          description: "An empty glass bottle",
        },
        removeComponents: ["renderFluidColor"],
      },
      {
        name: "mostlyEmpty",
        chanceToMutate: 0,
        addComponents: {
          appearance: {
            char: chars.bottleHalfFull,
            tint: colors.glass,
            tileSet: TileSet.Kenny,
          },
          renderFluidColor: true,
          description: "A mostly empty glass bottle",
        },
      },
      {
        name: "mostlyFull",
        chanceToMutate: 0,
        addComponents: {
          appearance: {
            char: chars.bottleHalfFull,
            tint: colors.glass,
            tileSet: TileSet.Kenny,
          },
          renderFluidColor: true,
          description: "A mostly full glass bottle",
        },
      },
      {
        name: "full",
        chanceToMutate: 0,
        addComponents: {
          appearance: {
            char: chars.bottleFull,
            tint: colors.glass,
            tileSet: TileSet.Kenny,
          },
          renderFluidColor: true,
          description: "A full glass bottle",
        },
      },
    ],
  },
};

// NOTE: Items
export const skulltoothPrefab: Entity = {
  ...baseItem,
  appearance: {
    char: chars.skulltooth,
    tint: colors.bone,
    tileSet: TileSet.Kenny,
  },
  name: "The Skulltooth",
  description: "A large tooth carved into the shape of a skull",
  kickable: {
    noiseLevel: 3,
    breakable: true,
  },
  mass: 1,
  material: Material.Bone,
};

export const coinPrefab: Entity = {
  ...baseItem,
  appearance: {
    char: chars.coin,
    tint: colors.gold,
    tileSet: TileSet.Kenny,
  },
  name: "coin",
  description: "A shiny gold coin",
  mass: 0.1,
  material: Material.Metal,
  currency: {
    value: 1,
  },
};

export const rockPrefab: Entity = {
  ...baseItem,
  appearance: {
    char: chars.rock,
    tint: colors.rock,
    tileSet: TileSet.Kenny,
  },
  name: "Rock",
  description: "A small, jagged stone—barely useful, unless thrown.",
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
    tileSet: TileSet.Kenny,
  },
  weaponClass: WeaponClass.Martial,
  attacks: [
    attacks.melee.stab(),
    attacks.melee.slash(),
    attacks.melee.bash({
      damageRoll: "1d4+2",
      knockbackDistance: undefined,
    }),
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
    tileSet: TileSet.Kenny,
  },
  attacks: [
    attacks.melee.bash({
      name: "Smash",
      verb: "smashes",
      verbPastTense: "smashed",
      damageRoll: "1d4",
    }),
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
    tileSet: TileSet.Kenny,
  },
  weaponClass: WeaponClass.Simple,
  attacks: [
    attacks.melee.bash({
      name: "Pummel",
      verb: "pummels",
      verbPastTense: "pummeled",
      damageRoll: "1d4",
      knockbackDistance: undefined,
    }),
    attacks.melee.stab({ damageRoll: "1d4" }),
    attacks.melee.slash({ damageRoll: "1d4" }),
  ],
  mass: 0.8,
  material: Material.Metal,
};

export const leatherArmor: Entity = {
  ...baseItem,
  appearance: {
    char: chars.armor,
    tint: colors.leather,
    tileSet: TileSet.Kenny,
  },
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
  ...baseTile,
  appearance: {
    char: chars.doorClosed,
    tint: colors.wood,
    tileSet: TileSet.Kenny,
  },
  appearanceCorpse: {
    char: chars.doorBroken,
    tint: colors.wood,
    tileSet: TileSet.Kenny,
  },
  name: "door",
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
  immunities: [DamageType.Poison, DamageType.Psychic, DamageType.Necrotic],
  effectImmunities: [EffectType.Knockback],
  baseArmorClass: 1,
  damages: [],
  mass: 10,
  material: Material.Wood,
};

export const stairsDownPrefab: Entity = {
  ...baseTile,
  appearance: {
    char: chars.stairsDown,
    tint: colors.stairsDown,
    tileSet: TileSet.Kenny,
  },
  name: "stairs down",
  stairsDown: true,
  description: "Stairs leading down",
  layer250: true,
  mass: 10,
  material: Material.Wood,
};

export const stairsUpPrefab: Entity = {
  ...baseTile,
  appearance: {
    char: chars.stairsUp,
    tint: colors.stairsUp,
    tileSet: TileSet.Kenny,
  },
  name: "stairs up",
  stairsUp: true,
  description: "Stairs leading up",
  layer250: true,
  mass: 10,
  material: Material.Wood,
};

// NOTE: Terrain / Map Features
export const wallPrefab: Entity = {
  ...baseTile,
  appearance: {
    char: chars.wall,
    tint: colors.wall,
    tileSet: TileSet.Kenny,
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
  ...baseTile,
  appearance: {
    char: chars.floor,
    tint: colors.floor,
    tileSet: TileSet.Kenny,
  },
  name: "floor",
  mass: 100,
  material: Material.Stone,
};

export const fluidContainerPrefab: Entity = {
  ...baseRenderable,
  name: "fluidContainer",
  layer150: true,
  appearance: {
    char: "",
    tint: 0x000,
    tileSet: TileSet.Kenny,
  },
  mass: 0,
  fluidContainer: { ...fluidContainerComponent },
};

export const grassPrefab: Entity = {
  ...baseTile,
  appearance: {
    char: chars.grass,
    tint: colors.plant,
    tileSet: TileSet.Kenny,
  },
  appearanceCorpse: {
    char: chars.grass,
    tint: colors.ash,
    tileSet: TileSet.Kenny,
  },
  health: { max: 10, current: 10 },
  damages: [],
  living: true,
  immunities: [DamageType.Fire],
  name: "grass",
  description: "Dry grass",
  layer125: true,
  mass: 0.4,
  material: Material.Plant,
  mutable: {
    current: "young",
    mutations: [
      {
        name: "burnt",
        next: "young",
        chanceToMutate: 0.01,
        forbid: ["trampled"],
        addComponents: {
          appearance: {
            char: chars.grass,
            tint: colors.ash,
            tileSet: TileSet.Kenny,
          },
        },
        removeComponents: ["flammable", "opaque"],
      },
      {
        name: "young",
        next: "medium",
        chanceToMutate: 0.0025,
        forbid: ["trampled"],
        addComponents: {
          appearance: {
            char: chars.grass,
            tint: colors.plant,
            tileSet: TileSet.Kenny,
          },
          calculateFlammability: true,
        },
        removeComponents: [],
      },
      {
        name: "medium",
        next: "mature",
        chanceToMutate: 0.0025,
        forbid: ["trampled"],
        addComponents: {
          appearance: {
            char: chars.mediumGrass,
            tint: colors.plant,
            tileSet: TileSet.Kenny,
          },
          calculateFlammability: true,
        },
        removeComponents: [],
      },
      {
        name: "mature",
        chanceToMutate: 0.0025,
        addComponents: {
          appearance: {
            char: chars.tallGrass,
            tint: colors.plant,
            tileSet: TileSet.Kenny,
          },
          calculateFlammability: true,
          opaque: true,
        },
        removeComponents: [],
      },
      {
        name: "trampled",
        next: "mature",
        chanceToMutate: 0.005,
        addComponents: {
          appearance: {
            char: chars.mediumGrass,
            tint: colors.plant,
            tileSet: TileSet.Kenny,
          },
        },
        removeComponents: ["opaque"],
      },
    ],
  },
};
