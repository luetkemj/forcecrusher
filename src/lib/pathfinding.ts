import PF from "pathfinding";
import { type Pos } from "./grid";
import { getState } from "../main";
import { world } from "../ecs/engine";

const entities = world.with("position");

export const aStar = (start: Pos, goal: Pos) => {
  const { width, height } = getState().views.map!;
  const matrix = new PF.Grid(width, height);

  for (const entity of entities) {
    if (entity.blocking && !entity.pathThrough) {
      const { x, y } = entity.position;
      matrix.setWalkableAt(x, y, false);
    }
  }

  matrix.setWalkableAt(start.x, start.y, true);
  matrix.setWalkableAt(goal.x, goal.y, true);

  const finder = new PF.AStarFinder({});

  const path = finder.findPath(start.x, start.y, goal.x, goal.y, matrix);

  return path;
};
