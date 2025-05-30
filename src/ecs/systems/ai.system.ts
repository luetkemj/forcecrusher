import { gameWorld } from "../engine";
import { aStar } from "../../lib/pathfinding";

export const aiSystem = () => {
  const pcQuery = gameWorld.world.with("pc", "position");
  const aiEntities = gameWorld.world.with("ai", "position");
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

      gameWorld.world.addComponent(entity, "tryMove", newPos);
    }
  }
};
