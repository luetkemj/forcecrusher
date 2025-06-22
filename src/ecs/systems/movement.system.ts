import { addLog } from "../../lib/utils";
import { IGameWorld } from "../engine";

export const createMovementSystem = (world: IGameWorld["world"]) => {
  const moveableQuery = world.with("position", "tryMove");
  const blockingQuery = world.with("blocking", "position");

  return function system() {
    for (const actor of moveableQuery) {
      const { position, tryMove } = actor;

      let blocked = false;

      for (const target of blockingQuery) {
        if (
          target.position.x === tryMove.x &&
          target.position.y === tryMove.y
        ) {
          world.removeComponent(actor, "tryMove");

          if (target.openable) {
            world.addComponent(actor, "tryOpen", {
              id: target.id,
            });
          } else if (target.health) {
            world.addComponent(actor, "tryAttack", { targetId: target.id });
          } else {
            if (actor.pc) {
              addLog(`${actor.name} blocked by ${target.name}`);
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

        world.removeComponent(actor, "tryMove");
      }
    }
  };
};
