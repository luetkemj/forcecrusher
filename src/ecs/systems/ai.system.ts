import { world } from "../engine";
import { aStar } from "../../lib/pathfinding";

const pcQuery = world.with("pc", "position");
const aiEntities = world.with("ai", "position");

export const aiSystem = () => {
  const [player] = pcQuery.entities;

  for (const entity of aiEntities) {
    const path = aStar(entity.position, player.position);

    if (!path[1]) return;

    const newPos = {
      x: path[1][0],
      y: path[1][1],
      z: entity.position.z,
    };

    world.addComponent(entity, "tryMove", newPos);
  }
};
