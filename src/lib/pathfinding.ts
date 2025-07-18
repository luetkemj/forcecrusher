import PF from "pathfinding";
import { CARDINAL, isAtSamePosition, toPosId, type Pos } from "./grid";
import { getState } from "../ecs/gameState";
import { Entity } from "../ecs/engine";
import { outOfBounds } from "./utils";

export function isBlocked(pos: Pos, entities: Array<Entity>) {
  let blocked = false;
  for (const entity of entities) {
    if (!entity.position) return false;
    if (isAtSamePosition(pos, entity.position)) {
      if (entity.blocking && !entity.pathThrough) {
        blocked = true;
      }
    }
  }
  return blocked;
}

export const aStar = (start: Pos, goal: Pos, entities: Array<Entity>) => {
  const { width, height } = getState().views.map!;
  const matrix = new PF.Grid(width, height);

  for (const entity of entities) {
    if (entity.blocking && !entity.pathThrough) {
      if (entity.position) {
        const { x, y } = entity.position;
        matrix.setWalkableAt(x, y, false);
      }
    }
  }

  matrix.setWalkableAt(start.x, start.y, true);
  matrix.setWalkableAt(goal.x, goal.y, true);

  const finder = new PF.AStarFinder({});

  const path = finder.findPath(start.x, start.y, goal.x, goal.y, matrix);

  return path;
};

interface WanderToward {
  currentPos: Pos;
  targetPos?: Pos;
  biasDir: Pos; // e.g. {x: 0, y: -1} to favor north
  entities: Array<Entity>;
  wiggleChance?: number; // 0–1: how much randomness to allow
  maxTries?: number;
}
export function wanderToward({
  currentPos,
  targetPos,
  biasDir,
  entities,
  wiggleChance = 0.5,
  maxTries = 10,
}: WanderToward): Pos {
  const dirChoices = getDirectionCandidates(biasDir, wiggleChance);

  for (let i = 0; i < Math.min(maxTries, dirChoices.length); i++) {
    const choice = dirChoices[i];
    const next = { x: currentPos.x + choice.x, y: currentPos.y + choice.y };

    if (targetPos && isAtSamePosition(next, targetPos)) {
      return next;
    }

    if (!isBlocked(next, entities)) {
      return next;
    }
  }

  // Fallback: don’t move
  return currentPos;
}

function getDirectionCandidates(biasDir: Pos, wiggleChance: number): Pos[] {
  const allDirs = CARDINAL;

  // Sort directions by how aligned they are with biasDir (dot product)
  const scored = allDirs.map((dir) => ({
    dir,
    score: dot(dir, biasDir) + (Math.random() - 0.5) * wiggleChance,
  }));

  // Sort highest to lowest
  scored.sort((a, b) => b.score - a.score);
  return scored.map((s) => s.dir);
}

function dot(a: Pos, b: Pos): number {
  return a.x * b.x + a.y * b.y;
}

export function propagateSmell(
  sourcePos: Pos,
  strength: number,
  isBlocked: (p: Pos) => boolean,
  isObscured: (p: Pos) => boolean,
): Map<string, number> {
  const visited = new Map<string, number>();
  const queue: Array<{ pos: Pos; strength: number }> = [
    { pos: sourcePos, strength },
  ];

  while (queue.length) {
    const { pos, strength } = queue.shift()!;
    const key = toPosId(pos);
    if (visited.has(key) || strength <= 0) continue;

    visited.set(key, strength);

    for (const dir of CARDINAL) {
      const next = { x: pos.x + dir.x, y: pos.y + dir.y };
      // if outOfBound - bail
      if (!outOfBounds(next)) {
        // if obscured, reduce smell & propogate
        if (isObscured(next)) {
          queue.push({ pos: next, strength: strength / 2 }); // or decay by distance
        }

        // if not blocked, propogate
        if (!isBlocked(next)) {
          queue.push({ pos: next, strength: strength - 1 }); // or decay by distance
        }
      }
    }
  }

  return visited; // maps posId -> smell strength
}
