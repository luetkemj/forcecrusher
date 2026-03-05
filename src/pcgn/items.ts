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

export const spawnSpellscroll = (position: Pos) => {
  const spellscroll = spawn("spellscroll", { position });

  const spellName = sample(Object.values(SpellName));

  if (spellName && spellscroll.readable && spellscroll.appearance) {
    const spell = spellLibrary[spellName];
    if (spell && spell.appearance) {
      spellscroll.readable.message = `You have read the scroll ${spell.displayName}!`;
      spellscroll.readable.spellName = spellName;
      spellscroll.appearance.tint = spell.appearance.tint;
    }
  }

  return spellscroll;
};

export const spawnHealthPotion = (position: Pos) => {
  spawn("healthPotion", { position });
};

export const spawnBottle = (position: Pos) => {
  spawn("bottleEmpty", { position });
};

export const spawnRock = (position: Pos) => {
  spawn("rock", { position });
};

// weighted item spawn
type Item = {
  spawn: Function;
  cost: number;
  min: number;
  max: number;
};

const ITEM_TABLE: Item[] = [
  { spawn: spawnSpellscroll, cost: 20, min: 3, max: 999 },
  { spawn: spawnHealthPotion, cost: 5, min: 2, max: 999 },
  { spawn: spawnBottle, cost: 3, min: 1, max: 999 },
  { spawn: spawnRock, cost: 1, min: 1, max: 999 },
];

const BUDGET_BASELINE = 5;
const BUDGET_TUNER = 0.5;
const TIER_CHUNK_SIZE = 3;

function tierWeight(item: Item, depth: number) {
  const tier = getTier(depth, TIER_CHUNK_SIZE);

  if (tier === 0 && item.spawn === spawnRock) return 4;
  if (tier === 1 && item.spawn === spawnBottle) return 4;
  if (tier === 2 && item.spawn === spawnHealthPotion) return 4;
  if (tier >= 3 && item.spawn === spawnSpellscroll) return 4;

  return 1;
}

function spawnSolo(item: Item, position: Pos) {
  const tile = getNearbyOpenTile(position);
  item.spawn(tile);
  return item.cost;
}

export function spawnItems(depth: number, floorTiles: Tile[]) {
  let budget = getFloorBudget(BUDGET_BASELINE, depth, BUDGET_TUNER);

  while (budget > 0) {
    const candidates = ITEM_TABLE.filter(
      (item) => depth >= item.min && depth <= item.max && item.cost <= budget,
    );

    if (!candidates.length) break;

    const weighted = candidates.map((e) => ({
      item: e,
      weight: tierWeight(e, depth) * (1 + depth * 0.15),
    }));

    const chosen = weightedRandom(weighted).item;
    const tile = sample(floorTiles);

    if (!tile) return;

    budget -= spawnSolo(chosen, tile);
  }
}
