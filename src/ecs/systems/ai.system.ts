import { world } from "../engine";
import { aStar } from "../../lib/pathfinding";

const pcQuery = world.with("pc", "position");
const aiEntities = world.with("ai", "position");

export const aiSystem = () => {
  const [player] = pcQuery.entities;

  for (const entity of aiEntities) {
    const path = aStar(entity.position, player.position);

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
