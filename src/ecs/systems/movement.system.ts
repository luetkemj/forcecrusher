import { world } from "../engine";

const moveableEntities = world.with("position", "tryMove");
const blockingEntities = world.with("blocking", "position");

export const movementSystem = () => {
  for (const entity of moveableEntities) {
    const { position, tryMove } = entity;

    let blocked = false;

    for (const blocker of blockingEntities) {
      if (
        blocker.position.x === tryMove.x &&
        blocker.position.y === tryMove.y
      ) {
        world.removeComponent(entity, "tryMove");

        if (blocker.health) {
          // you have attacked!
          blocker.health.current -= 5;

          console.log(`${blocker.name} attacked by ${entity.name} for 5hp`);
        } else {
          console.log(`${entity.name} blocked by ${blocker.name}`);
        }

        blocked = true;

        break;
      }
    }

    if (!blocked) {
      position.x = tryMove.x;
      position.y = tryMove.y;
      position.z = tryMove.z;

      world.removeComponent(entity, "tryMove");
    }
  }
};
