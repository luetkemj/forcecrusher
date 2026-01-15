import { Entity } from "../ecs/engine";
import { castCreateBlood } from "./spellbook/createBlood.ts";
import { castCreateLava } from "./spellbook/createLava.ts";
import { castCreateOil } from "./spellbook/createOil.ts";
import { castCreateWater } from "./spellbook/createWater.ts";

export interface SpellContext {
  caster: Entity;
  targets: Entity[];
}

export const castSpell = {
  createBlood: (ctx: SpellContext) => castCreateBlood(ctx),
  createLava: (ctx: SpellContext) => castCreateLava(ctx),
  createOil: (ctx: SpellContext) => castCreateOil(ctx),
  createWater: (ctx: SpellContext) => castCreateWater(ctx),
};
