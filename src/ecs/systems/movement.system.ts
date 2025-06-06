import { addLog } from "../../lib/utils";
import { gameWorld } from "../engine";

const moveableEntities = gameWorld.world.with("position", "tryMove");
const blockingEntities = gameWorld.world.with("blocking", "position");

export const movementSystem = () => {
  for (const movingEntity of moveableEntities) {
    const { position, tryMove } = movingEntity;

    let blocked = false;

    for (const blockingEntity of blockingEntities) {
      if (
        blockingEntity.position.x === tryMove.x &&
        blockingEntity.position.y === tryMove.y
      ) {
        gameWorld.world.removeComponent(movingEntity, "tryMove");

        if (blockingEntity.health) {
          // meleeAttack(movingEntity, blockingEntity);
          gameWorld.world.addComponent(
            movingEntity,
            "attackTarget",
            blockingEntity,
          );
        } else {
          if (movingEntity.pc) {
            addLog(`${movingEntity.name} blocked by ${blockingEntity.name}`);
          }
        }

        blocked = true;

        break;
      }
    }

    if (!blocked) {
      position.x = tryMove.x;
      position.y = tryMove.y;
      position.z = tryMove.z;

      gameWorld.world.removeComponent(movingEntity, "tryMove");
    }
  }
};
