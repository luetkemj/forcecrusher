import { sample } from "lodash";
import { spawn } from "../actors";
import { type Pos } from "../lib/grid";
import { SpellName } from "../ecs/enums";
import { spellLibrary } from "../spells";
import { Tile } from "./dungeon";
import {
  getFloorBudget,
  getNearbyOpenTile,
  getTier,
  weightedRandom,
} from "../lib/utils";
import { Spell, Entity } from "../ecs/engine";

const editSpellbook = (spell: Spell, spellbook: Entity) => {
  if (spell.appearance && spellbook.readable && spellbook.appearance) {
    spellbook.readable.message = `You have learned ${spell.displayName}!`;
    spellbook.readable.spellName = spell.name;
    spellbook.appearance.tint = spell.appearance.tint;
  }
};

export const spawnSpellbookCreateBlood = (position: Pos) => {
  const spell = spellLibrary[SpellName.CreateBlood];
  const spellbook = spawn("spellbook", { position });
  editSpellbook(spell, spellbook);

  return spellbook;
};

export const spawnSpellbookCreateWater = (position: Pos) => {
  const spell = spellLibrary[SpellName.CreateWater];
  const spellbook = spawn("spellbook", { position });
  editSpellbook(spell, spellbook);

  return spellbook;
};

export const spawnSpellbookCreateOil = (position: Pos) => {
  const spell = spellLibrary[SpellName.CreateOil];
  const spellbook = spawn("spellbook", { position });
  editSpellbook(spell, spellbook);

  return spellbook;
};

export const spawnSpellbookDesiccate = (position: Pos) => {
  const spell = spellLibrary[SpellName.Desiccate];
  const spellbook = spawn("spellbook", { position });
  editSpellbook(spell, spellbook);

  return spellbook;
};

export const spawnSpellbookKnock = (position: Pos) => {
  const spell = spellLibrary[SpellName.Knock];
  const spellbook = spawn("spellbook", { position });
  editSpellbook(spell, spellbook);

  return spellbook;
};

// weighted item spawn
type Item = {
  spawn: Function;
  cost: number;
  min: number;
  max: number;
};

const ITEM_TABLE: Item[] = [
  { spawn: spawnSpellbookCreateBlood, cost: 1, min: 9, max: 999 },
  { spawn: spawnSpellbookCreateWater, cost: 1, min: 9, max: 999 },
  { spawn: spawnSpellbookCreateOil, cost: 1, min: 9, max: 999 },
  { spawn: spawnSpellbookDesiccate, cost: 1, min: 9, max: 999 },
  { spawn: spawnSpellbookKnock, cost: 1, min: 9, max: 999 },
];

const BUDGET_BASELINE = 5;
const BUDGET_TUNER = 0.5;
const TIER_CHUNK_SIZE = 3;

function tierWeight(item: Item, depth: number) {
  const tier = getTier(depth, TIER_CHUNK_SIZE);

  if (tier === 3 && item.spawn === spawnSpellbookCreateBlood) return 4;
  if (tier === 3 && item.spawn === spawnSpellbookCreateWater) return 4;
  if (tier === 3 && item.spawn === spawnSpellbookCreateOil) return 4;
  if (tier === 3 && item.spawn === spawnSpellbookKnock) return 5;
  if (tier >= 4 && item.spawn === spawnSpellbookDesiccate) return 4;

  return 1;
}

function spawnSolo(item: Item, position: Pos) {
  const tile = getNearbyOpenTile(position);
  item.spawn(tile);
  return item.cost;
}

export function spawnSpellbooks(depth: number, floorTiles: Tile[]) {
  let budget = getFloorBudget(BUDGET_BASELINE, depth, BUDGET_TUNER);

  const candidates = ITEM_TABLE.filter(
    (item) => depth >= item.min && depth <= item.max && item.cost <= budget,
  );

  if (!candidates.length) return;

  const weighted = candidates.map((e) => ({
    item: e,
    weight: tierWeight(e, depth) * (1 + depth * 0.15),
  }));

  const chosen = weightedRandom(weighted).item;
  const tile = sample(floorTiles);

  if (!tile) return;

  spawnSolo(chosen, tile);
}
