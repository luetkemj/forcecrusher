import { World } from "miniplex";
import { Entity } from "../ecs/engine";
import { castCreateBlood } from "./spellbook/createBlood.ts";
import { castCreateLava } from "./spellbook/createLava.ts";
import { castCreateOil } from "./spellbook/createOil.ts";
import { castCreateWater } from "./spellbook/createWater.ts";
import { castDesiccate } from "./spellbook/desiccate.ts";
import { castIgnite } from "./spellbook/ignite.ts";
import { castInferno } from "./spellbook/inferno.ts";
import { castFireWall } from "./spellbook/fireWall.ts";

export interface SpellContext {
  caster: Entity;
  targets: Entity[];
  world: World<Entity>;
}

export const castSpell = {
  createBlood: (ctx: SpellContext) => castCreateBlood(ctx),
  createLava: (ctx: SpellContext) => castCreateLava(ctx),
  createOil: (ctx: SpellContext) => castCreateOil(ctx),
  createWater: (ctx: SpellContext) => castCreateWater(ctx),
  desiccate: (ctx: SpellContext) => castDesiccate(ctx),
  fireWall: (ctx: SpellContext) => castFireWall(ctx),
  ignite: (ctx: SpellContext) => castIgnite(ctx),
  inferno: (ctx: SpellContext) => castInferno(ctx),
};
