import { world } from "../engine";

const moveableEntities = world.with("position", "tryMove").without("paused");
const blockingEntities = world.with("blocking", "position").without("paused");

export const movementSystem = () => {
  for (const entity of moveableEntities) {
    const { position, tryMove } = entity;

    for (const blocker of blockingEntities) {
      if (
        blocker.position.x === entity.tryMove.x &&
        blocker.position.y === entity.tryMove.y
      ) {
        world.removeComponent(entity, "tryMove");
        return console.log(`blocked by ${blocker.name}`);
      }
    }

    position.x = tryMove.x;
    position.y = tryMove.y;
    position.z = tryMove.z;

    world.removeComponent(entity, "tryMove");
  }
};
