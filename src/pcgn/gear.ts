import { sample } from "lodash";
import { spawn } from "../actors";
import { type Pos } from "../lib/grid";
import { Tile } from "./dungeon";
import { getNearbyOpenTile, getTier, weightedRandom } from "../lib/utils";

export const spawnShortsword = (position: Pos) => {
  spawn("shortsword", { position });
};

export const spawnClub = (position: Pos) => {
  spawn("club", { position });
};

export const spawnDagger = (position: Pos) => {
  spawn("dagger", { position });
};

export const spawnLeatherArmor = (position: Pos) => {
  spawn("leatherArmor", { position });
};

export const spawnChainmailArmor = (position: Pos) => {
  spawn("chainmailArmor", { position });
};

export const spawnPaddedArmor = (position: Pos) => {
  spawn("paddedArmor", { position });
};

// weighted item spawn
type Item = {
  spawn: Function;
  cost: number;
  min: number;
  max: number;
};

const ITEM_TABLE: Item[] = [
  { spawn: spawnDagger, cost: 2, min: 2, max: 999 },
  { spawn: spawnLeatherArmor, cost: 2, min: 2, max: 999 },
  { spawn: spawnShortsword, cost: 4, min: 4, max: 999 },
  { spawn: spawnChainmailArmor, cost: 4, min: 4, max: 999 },
  { spawn: spawnClub, cost: 8, min: 8, max: 999 },
  { spawn: spawnPaddedArmor, cost: 8, min: 8, max: 999 },
];

const BUDGET_BASELINE = 1;
const TIER_CHUNK_SIZE = 3;

function tierWeight(item: Item, depth: number) {
  const tier = getTier(depth, TIER_CHUNK_SIZE);

  if (tier === 0 && item.spawn === spawnDagger) return 4;
  if (tier === 1 && item.spawn === spawnShortsword) return 4;
  if (tier === 2 && item.spawn === spawnClub) return 4;

  return 1;
}

function spawnSolo(item: Item, position: Pos) {
  const tile = getNearbyOpenTile(position);
  item.spawn(tile);
  return item.cost;
}

export function spawnGear(depth: number, floorTiles: Tile[]) {
  let budget = Math.floor(BUDGET_BASELINE + depth);

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
