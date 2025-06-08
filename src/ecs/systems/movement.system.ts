import { addLog } from "../../lib/utils";
import { IGameWorld } from "../engine";

export const createMovementSystem = (world: IGameWorld["world"]) => {
  const moveableQuery = world.with("position", "tryMove");
  const blockingQuery = world.with("blocking", "position");

  return function system() {
    for (const movingEntity of moveableQuery) {
      const { position, tryMove } = movingEntity;

      let blocked = false;

      for (const blockingEntity of blockingQuery) {
        if (
          blockingEntity.position.x === tryMove.x &&
          blockingEntity.position.y === tryMove.y
        ) {
          world.removeComponent(movingEntity, "tryMove");

          if (blockingEntity.health) {
            // meleeAttack(movingEntity, blockingEntity);
            world.addComponent(movingEntity, "attackTarget", blockingEntity);
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

        world.removeComponent(movingEntity, "tryMove");
      }
    }
  };
};
