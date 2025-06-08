import type { IGameWorld } from "../engine";
import { aStar } from "../../lib/pathfinding";

export const createAiSystem = (world: IGameWorld["world"]) => {
  const pcQuery = world.with("pc", "position");
  const aiQuery = world.with("ai", "position");
  const positionQuery = world.with("position");

  return function ai() {
    const [player] = pcQuery.entities;

    for (const entity of aiQuery) {
      const path = aStar(
        entity.position,
        player.position,
        positionQuery.entities,
      );

      // the start and end positions are the first and last indices of path
      // start is the current location of pathing entity
      // so we skip it.
      if (path[1]) {
        const newPos = {
          x: path[1][0],
          y: path[1][1],
          z: entity.position.z,
        };

        world.addComponent(entity, "tryMove", newPos);
      }
    }
  };
};
