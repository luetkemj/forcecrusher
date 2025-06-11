import { remove, tail } from "lodash";
import { getState } from "../gameState";
import { addLog, logFrozenEntity, isSamePosition } from "../../lib/utils";
import { IGameWorld, Entity } from "../engine";
import { line, Pos } from "../../lib/grid";
import { rangeAttack } from "../../lib/combat";

import {} from "../engine";

export const createThrowSystem = (
  world: IGameWorld["world"],
  registry: IGameWorld["registry"],
) => {
  const tryThrowQuery = world.with("tryThrow");
  const blockingQuery = world.with("blocking", "position");

  return function system() {
    for (const entity of tryThrowQuery) {
      // get thrower entity
      const { throwerId } = entity.tryThrow;
      const thrownId = entity.id;

      const throwerEntity = registry.get(throwerId);
      const thrownEntity = entity;

      // error checks
      if (!throwerEntity) {
        console.log(`dropperId: ${throwerId} does not exist`);
        logFrozenEntity(thrownEntity);

        world.removeComponent(thrownEntity, "tryThrow");
        break;
      }

      if (!throwerEntity.container) {
        console.log(`thrower: ${throwerId} has no container`);
        logFrozenEntity(thrownEntity);
        logFrozenEntity(throwerEntity);

        world.removeComponent(thrownEntity, "tryThrow");
        break;
      }

      let hitEntity: Entity | undefined;
      let restingPosition: Pos | undefined;
      let blocked = false;

      if (throwerEntity.position) {
        const pos0 = throwerEntity.position;
        const pos1 = getState().cursor[1];

        // get throwline
        const throwLine = line(pos0, pos1);

        // check for blocker along throwline
        for (let i = 0; i < tail(throwLine).length; i++) {
          const value = tail(throwLine)[i];

          for (const blocker of blockingQuery) {
            if (isSamePosition(blocker.position, value)) {
              blocked = true;
              hitEntity = blocker;
              restingPosition = throwLine[i];
              break;
            }
          }

          if (blocked) break;
        }
      }

      if (blocked) {
        // put entity to be thrown on at cursor location
        const position = restingPosition;
        if (position) {
          thrownEntity.position = { ...position };
        }

        if (hitEntity?.health) {
          rangeAttack(throwerEntity, hitEntity, thrownEntity);
        }
      } else {
        // put entity to be thrown on at cursor location
        const position = getState().cursor[1];
        thrownEntity.position = { ...position };
        logFrozenEntity(thrownEntity);

        addLog(`${throwerEntity.name} throws ${thrownEntity.name}`);
      }

      // remove item from dropper's inventory
      remove(throwerEntity.container.contents, (id) => thrownId === id);
      world.removeComponent(thrownEntity, "tryThrow");
    }
  };
};
