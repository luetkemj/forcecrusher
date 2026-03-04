import { random, sample, times } from "lodash";
import {
  wield,
  wear,
  getNearbyOpenTile,
  weightedRandom,
  getTier,
  getFloorBudget,
} from "../lib/utils";
import { calcAverageDamage } from "../lib/combat";
import { spawn } from "../actors";
import { type Pos } from "../lib/grid";
import { Tile } from "./dungeon";

export const spawnGoblin = (position: Pos) => {
  const mob = spawn("goblin", { position });
  const weapon = spawn("dagger");
  const armor = spawn("leatherArmor");

  if (random(0, 1)) {
    wield(mob, weapon);
  }

  if (random(0, 1)) {
    wear(mob, armor);
  }

  mob.averageDamage = calcAverageDamage(mob);

  return mob;
};

export const spawnOgre = (position: Pos) => {
  const mob = spawn("ogre", { position });
  mob.averageDamage = calcAverageDamage(mob);

  return mob;
};

export const spawnOwlbear = (position: Pos) => {
  const mob = spawn("owlbear", { position });
  mob.averageDamage = calcAverageDamage(mob);

  return mob;
};

export const spawnLavaGolem = (position: Pos) => {
  const mob = spawn("lavaGolem", { position });
  mob.averageDamage = calcAverageDamage(mob);

  return mob;
};

export const spawnRat = (position: Pos) => {
  const mob = spawn("rat", { position });
  mob.averageDamage = calcAverageDamage(mob);

  return mob;
};

export const spawnSkeleton = (position: Pos) => {
  const mob = spawn("skeleton", { position });
  const weapon = spawn("shortsword");
  const armor = spawn("leatherArmor");
  times(1, () =>
    spawn("healthPotion", {
      position,
      tryPickUp: { pickerId: mob.id },
    }),
  );

  wield(mob, weapon);
  wear(mob, armor);

  return mob;
};

export const spawnLivingSponge = (position: Pos) => {
  const mob = spawn("livingSponge", { position });
  if (mob.fluidContainer) {
    mob.fluidContainer.maxVolume = 5;
  }

  return mob;
};

// weighted enemy spawn
type Enemy = {
  spawn: Function;
  cost: number;
  min: number;
  max: number;
  pack?: [number, number];
};
const ENEMY_TABLE: Enemy[] = [
  { spawn: spawnRat, cost: 1, min: 1, max: 6, pack: [4, 8] },
  { spawn: spawnGoblin, cost: 2, min: 2, max: 12, pack: [2, 5] },
  { spawn: spawnSkeleton, cost: 3, min: 4, max: 18, pack: [2, 4] },
  { spawn: spawnLivingSponge, cost: 4, min: 6, max: 20 },
  { spawn: spawnOgre, cost: 6, min: 8, max: 999, pack: [1, 2] },
  { spawn: spawnOwlbear, cost: 9, min: 11, max: 999 },
  { spawn: spawnLavaGolem, cost: 14, min: 14, max: 999 },
];

const BUDGET_BASELINE = 8;
const BUDGET_TUNER = 0.9;
const TIER_CHUNK_SIZE = 3;

function tierWeight(enemy: Enemy, depth: number) {
  const tier = getTier(depth, TIER_CHUNK_SIZE);

  if (tier === 0 && enemy.spawn === spawnRat) return 4;
  if (tier === 1 && enemy.spawn === spawnGoblin) return 4;
  if (tier === 2 && enemy.spawn === spawnSkeleton) return 4;
  if (tier === 3 && enemy.spawn === spawnOgre) return 4;
  if (tier >= 4 && enemy.spawn === spawnLavaGolem) return 5;

  return 1;
}

function spawnPack(enemy: Enemy, position: Pos, budget: number) {
  if (!enemy.pack) return 0;
  const [min, max] = enemy.pack;
  const count = random(min, max);
  let budgetRemaining = budget;
  let spawnCount = 0;

  times(count, () => {
    const tile = getNearbyOpenTile(position);
    if (budgetRemaining >= enemy.cost) {
      enemy.spawn(tile);
      budgetRemaining -= enemy.cost;
      spawnCount += enemy.cost;
    }
  });

  return enemy.cost * spawnCount;
}

function spawnSolo(enemy: Enemy, position: Pos) {
  const tile = getNearbyOpenTile(position);
  enemy.spawn(tile);
  return enemy.cost;
}

export function spawnEnemies(depth: number, floorTiles: Tile[]) {
  let budget = getFloorBudget(BUDGET_BASELINE, depth, BUDGET_TUNER);

  // elite spike
  // TODO: getElite - some amount above current tier
  if (Math.random() < 0.05 + depth * 0.01) {
    const tile = sample(floorTiles);
    if (tile) {
      spawnOwlbear(tile);
      budget -= 9;
    }
  }

  while (budget > 0) {
    const candidates = ENEMY_TABLE.filter(
      (e) => depth >= e.min && depth <= e.max && e.cost <= budget,
    );

    if (!candidates.length) break;

    const weighted = candidates.map((e) => ({
      enemy: e,
      weight: tierWeight(e, depth) * (1 + depth * 0.15),
    }));

    const chosen = weightedRandom(weighted).enemy;
    const tile = sample(floorTiles);

    if (!tile) return;

    let spent = 0;

    if (random(1, 3) === 1) {
      spent = spawnPack(chosen, tile, budget);
    } else {
      spent = spawnSolo(chosen, tile);
    }

    budget -= spent;
  }
}
