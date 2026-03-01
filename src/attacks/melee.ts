// name: string;
// toHit: number;
// attackType: AttackType;
// damageRoll: string;
// damageType: DamageType;
// useModifier?: true;
// verb: string;
// verbPastTense: string;
// magical?: true;
// natural?: true;
// knockbackDistance?: number; // TODO: this should be based on target weight and actor strenth/skill
// // TODO: add effects to attacks, like poison

import { Attack } from "../ecs/engine";
import { AttackType, DamageType } from "../ecs/enums";

export const kick = (opts?: Partial<Attack>): Attack => {
  return {
    name: "Kick",
    verb: "kicks",
    verbPastTense: "kicked",
    toHit: 0,
    attackType: AttackType.Melee,
    damageRoll: "1d1",
    damageType: DamageType.Bludgeoning,
    natural: true,
    knockbackDistance: 2,
    useModifier: true,
    ...opts,
  };
};

export const bite = (opts?: Partial<Attack>): Attack => {
  return {
    name: "Bite",
    verb: "bites",
    verbPastTense: "bit",
    toHit: 0,
    attackType: AttackType.Melee,
    damageRoll: "1d1",
    damageType: DamageType.Piercing,
    useModifier: true,
    ...opts,
  };
};

export const claw = (opts?: Partial<Attack>): Attack => {
  return {
    name: "Claw",
    verb: "claws",
    verbPastTense: "clawed",
    toHit: 0,
    attackType: AttackType.Melee,
    damageRoll: "1d1",
    damageType: DamageType.Slashing,
    useModifier: true,
    ...opts,
  };
};

export const lavaPunch = (opts?: Partial<Attack>): Attack => {
  return {
    name: "Lava Punch",
    verb: "punches",
    verbPastTense: "punched",
    toHit: 0,
    attackType: AttackType.Melee,
    damageRoll: "1d6",
    damageType: DamageType.Fire,
    useModifier: true,
    ...opts,
  };
};

export const beak = (opts?: Partial<Attack>): Attack => {
  return {
    name: "Beak",
    verb: "pecks",
    verbPastTense: "pecked",
    toHit: 0,
    attackType: AttackType.Melee,
    damageRoll: "1d6",
    useModifier: true,
    damageType: DamageType.Piercing,
    knockbackDistance: 0,
    ...opts,
  };
};

export const bash = (opts?: Partial<Attack>): Attack => {
  return {
    name: "Bash",
    verb: "bashes",
    verbPastTense: "bashed",
    toHit: 0,
    attackType: AttackType.Melee,
    damageRoll: "1d6",
    damageType: DamageType.Bludgeoning,
    knockbackDistance: 2,
    useModifier: true,
    ...opts,
  };
};

export const stomp = (opts?: Partial<Attack>): Attack => {
  return {
    name: "Stomp",
    verb: "stomps",
    verbPastTense: "stomped",
    toHit: 0,
    attackType: AttackType.Melee,
    damageRoll: "1d6",
    damageType: DamageType.Bludgeoning,
    useModifier: true,
    ...opts,
  };
};

export const stab = (opts?: Partial<Attack>): Attack => {
  return {
    name: "Stab",
    verb: "stabs",
    verbPastTense: "stabbed",
    toHit: 0,
    attackType: AttackType.Melee,
    damageRoll: "1d6+2",
    damageType: DamageType.Piercing,
    useModifier: true,
    ...opts,
  };
};

export const slash = (opts?: Partial<Attack>): Attack => {
  return {
    name: "Slash",
    verb: "slashes",
    verbPastTense: "slashed",
    toHit: 0,
    attackType: AttackType.Melee,
    damageRoll: "1d6+2",
    damageType: DamageType.Slashing,
    useModifier: true,
    ...opts,
  };
};
