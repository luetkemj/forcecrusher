import { sample } from "lodash";
import { spawn } from "../actors";
import { type Pos } from "../lib/grid";
import { SpellName } from "../ecs/enums";
import { spellLibrary } from "../spells";
import { Tile } from "./dungeon";
import {
  WeightedSpawn,
  getFloorBudget,
  getTier,
  spawnSolo,
  weightedRandom,
} from "../lib/utils";

const spawnSpellscroll = (position: Pos, spellName: SpellName) => {
  const spellscroll = spawn("spellscroll", { position });

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

const spawnSpellscrollCreateLava = (position: Pos) =>
  spawnSpellscroll(position, SpellName.CreateLava);
const spawnSpellscrollFireWall = (position: Pos) =>
  spawnSpellscroll(position, SpellName.FireWall);
const spawnSpellscrollIgnite = (position: Pos) =>
  spawnSpellscroll(position, SpellName.Ignite);
const spawnSpellscrollInferno = (position: Pos) =>
  spawnSpellscroll(position, SpellName.Inferno);
const spawnSpellscrollKill = (position: Pos) =>
  spawnSpellscroll(position, SpellName.Kill);
const spawnSpellscrollMassKill = (position: Pos) =>
  spawnSpellscroll(position, SpellName.MassKill);

const ITEM_TABLE: WeightedSpawn[] = [
  { spawn: spawnSpellscrollKill, cost: 1, min: 3, max: 999 },
  { spawn: spawnSpellscrollIgnite, cost: 1, min: 4, max: 999 },
  { spawn: spawnSpellscrollCreateLava, cost: 1, min: 5, max: 999 },
  { spawn: spawnSpellscrollFireWall, cost: 1, min: 10, max: 999 },
  { spawn: spawnSpellscrollInferno, cost: 1, min: 11, max: 999 },
  { spawn: spawnSpellscrollMassKill, cost: 1, min: 12, max: 999 },
];

const BUDGET_BASELINE = 5;
const BUDGET_TUNER = 0.5;
const TIER_CHUNK_SIZE = 3;

function tierWeight(item: WeightedSpawn, depth: number) {
  const tier = getTier(depth, TIER_CHUNK_SIZE);
  const unlockTier = getTier(item.min, TIER_CHUNK_SIZE);
  return tier === unlockTier ? 4 : 1;
}

export function spawnSpellscrolls(depth: number, floorTiles: Tile[]) {
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
