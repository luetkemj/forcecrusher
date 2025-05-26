import { remove, tail } from "lodash";
import { getState } from "../../main";
import { addLog, logFrozenEntity, isSamePosition } from "../../lib/utils";
import { Entity, world } from "../engine";
import { line, Pos } from "../../lib/grid";

const tryThrowEntities = world.with("tryThrow");
const blockingEntities = world.with("blocking", "position");

export const throwSystem = () => {
  for (const entity of tryThrowEntities) {
    // get thrower entity
    const { throwerId } = entity.tryThrow;
    const thrownId = world.id(entity);

    const throwerEntity = world.entity(throwerId);
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
      console.log(throwLine);

      // loop through throwLine
      for (const blocker of blockingEntities) {
        for (let i = 0; i < tail(throwLine).length; i++) {
          const value = tail(throwLine)[i];
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
      console.log({
        blocked,
        hitEntity,
        restingPosition,
      });
    } else {
      // put entity to be thrown on at cursor location
      const position = getState().cursor[1];

      // if we throw items that already have a position (kicking) this won't work cause addComponent doesn't overwrite existing components
      world.addComponent(thrownEntity, "position", { ...position });

      // remove item from dropper's inventory
      remove(throwerEntity.container.contents, (id) => thrownId === id);
      world.removeComponent(thrownEntity, "tryThrow");

      addLog(`${throwerEntity.name} throws ${thrownEntity.name}`);

      console.log("butter");
    }
  }
};
