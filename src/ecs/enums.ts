export enum DamageType {
  Acid = "acid",
  Bludgeoning = "bludgeoning",
  Cold = "cold",
  Fire = "fire",
  Force = "force",
  Lightning = "lightning",
  Necrotic = "necrotic",
  Piercing = "piercing",
  Poison = "poison",
  Psychic = "psychic",
  Radiant = "radiant",
  Slashing = "slashing",
  Thunder = "thunder",
}

export enum DungeonTags {
  Dirt = "dirt",
  Floor = "floor",
  Passage = "passage",
  Perimeter = "perimeter",
  Room = "room",
  Wall = "wall",
}

export enum EntityKind {
  Beast = "beast",
  Humanoid = "humanoid",
  Player = "player",
  Undead = "undead",
}

export enum Disposition {
  Hostile = -2,
  Unfriendly = -1,
  Neutral = 0,
  Friendly = 1,
  Allied = 2,
}

export enum EffectType {
  Knockback = "knockback",
}

export enum OpenState {
  Closed = "closed",
  Open = "open",
  Ajar = "ajar",
  Jammed = "jammed",
  Broken = "broken",
  Sealed = "sealed",
}

export enum Sense {
  Sight = "sight",
  Hearing = "hearing",
  Smell = "smell",
  Taste = "taste",
  Touch = "touch",
}

export enum WeaponClass {
  Martial = "martial",
  Simple = "simple",
}

export enum WeaponType {
  Melee = "melee",
  Ranged = "ranged",
}

export enum Material {
  Flesh = "flesh",
  Metal = "metal",
  Blood = "blood",
  Bone = "bone",
  Glass = "glass",
  Stone = "stone",
  Wood = "wood",
  Lava = "lava",
  Leather = "leather",
  Cloth = "cloth",
  Paper = "paper",
  Oil = "oil", // For barrels, slimes, traps
  Plant = "plant", // Bushes, mushrooms, roots
  Water = "water",
}

export enum Fluids {
  Oil = "oil",
  Blood = "blood",
  Water = "water",
  Lava = "lava",
}

export enum SpellName {
  CreateBlood = "createBlood",
  CreateLava = "createLava",
  CreateOil = "createOil",
  CreateWater = "createWater",
  Desiccate = "desiccate",
  FireWall = "fireWall",
  Ignite = "ignite",
  Inferno = "inferno",
  Kill = "kill",
  Knock = "knock",
  MassKill = "massKill",
  Paralyze = "paralyze",
}

export enum DispelName {
  Desiccate = "uncastDesiccate",
}

export enum SpellShape {
  Circle = "circle",
  // Cone = "cone",
  Line = "line",
  Point = "point",
  // Rectangle = "rectangle",
}

export enum ReadableType {
  Spellbook = "spellbook",
  Scroll = "scroll",
  Text = "text",
}

export enum SpellCastType {
  KnownSpell = "knownSpell",
  Spellscroll = "spellscroll",
  // Spellwand = "spellwand",
  // Spellstaff = "spellstaff",
}

export enum TileSet {
  Ascii = "ascii",
  Text = "text",
  Kenny = "kenny",
  Tile = "tile",
}
