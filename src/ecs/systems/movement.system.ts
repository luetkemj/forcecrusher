import { toPosId } from "../../lib/grid";
import {
  addLog,
  getDisposition,
  getEAP,
  updatePosition,
} from "../../lib/utils";
import { IGameWorld } from "../engine";

export const createMovementSystem = ({ world, registry }: IGameWorld) => {
  const moveableQuery = world
    .with("position", "tryMove")
    .without("excludeFromSim");
  const blockingQuery = world
    .with("blocking", "position")
    .without("excludeFromSim");

  return function movementSystem() {
    for (const actor of moveableQuery) {
      const { tryMove } = actor;

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
            // if pc - assume attack
            // if ai, check disposition towards target
            if (actor.pc || getDisposition(actor, target) === -2) {
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

      // Trample entities at location
      for (const eId of getEAP(toPosId(tryMove)) || []) {
        const entity = registry.get(eId);
        if (entity) {
          if (
            entity.mutable &&
            entity.mutable.mutations.find((x) => x.name === "trampled")
          ) {
            world.addComponent(entity, "mutateTo", { name: "trampled" });
          }
        }
      }

      if (!blocked) {
        updatePosition(world, actor, tryMove);

        world.addComponent(actor, "sound", { strength: 10 });
        world.removeComponent(actor, "tryMove");
      }
    }
  };
};
