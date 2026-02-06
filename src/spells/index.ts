import { World } from "miniplex";
import { Entity, Spell } from "../ecs/engine";
import { castCreateBlood, createBlood } from "./spellbook/createBlood.ts";
import { castCreateLava, createLava } from "./spellbook/createLava.ts";
import { castCreateOil, createOil } from "./spellbook/createOil.ts";
import { castCreateWater, createWater } from "./spellbook/createWater.ts";
import {
  castDesiccate,
  desiccate,
  uncastDesiccate,
} from "./spellbook/desiccate.ts";
import { castIgnite, ignite } from "./spellbook/ignite.ts";
import { castInferno, inferno } from "./spellbook/inferno.ts";
import { castFireWall, fireWall } from "./spellbook/fireWall.ts";
import { castKill, kill } from "./spellbook/kill.ts";
import { castKnock, knock } from "./spellbook/knock.ts";
import { castMassKill, massKill } from "./spellbook/massKill.ts";
import { SpellName } from "../ecs/enums.ts";

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
  kill: (ctx: SpellContext) => castKill(ctx),
  knock: (ctx: SpellContext) => castKnock(ctx),
  massKill: (ctx: SpellContext) => castMassKill(ctx),
};

export const spellLibrary = {
  createBlood,
  createLava,
  createOil,
  createWater,
  desiccate,
  ignite,
  inferno,
  fireWall,
  kill,
  knock,
  massKill,
} as Record<SpellName, Spell>;


type DispelFunction = (world: World<Entity>, entity: Entity) => void;

export const dispelLibrary: Record<string, DispelFunction> = {
  uncastDesiccate,
};