import { addLog } from "../../lib/utils";
import { IGameWorld } from "../engine";
import { camelCase } from "lodash";

export const createMovementSystem = ({ world }: IGameWorld) => {
  const moveableQuery = world.with("position", "tryMove");
  const blockingQuery = world.with("blocking", "position");

  return function movementSystem() {
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
            const actorFaction = camelCase(actor.name);
            const targetFaction = camelCase(target.name);

            if (targetFaction === "player") {
              world.addComponent(actor, "tryAttack", { targetId: target.id });
            } else if (actorFaction === "player") {
              world.addComponent(actor, "tryAttack", { targetId: target.id });
            }
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

        world.removeComponent(actor, "tryMove");
      }
    }
  };
};
