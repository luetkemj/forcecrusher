import { remove, tail } from "lodash";
import { getState } from "../../main";
import { addLog, logFrozenEntity, isSamePosition } from "../../lib/utils";
import { Entity, gameWorld } from "../engine";
import { line, Pos } from "../../lib/grid";

export const throwSystem = () => {
  const tryThrowEntities = gameWorld.world.with("tryThrow");
  const blockingEntities = gameWorld.world.with("blocking", "position");
  for (const entity of tryThrowEntities) {
    // get thrower entity
    const { throwerId } = entity.tryThrow;
    const thrownId = entity.id;

    const throwerEntity = gameWorld.registry.get(throwerId);
    const thrownEntity = entity;

    // error checks
    if (!throwerEntity) {
      console.log(`dropperId: ${throwerId} does not exist`);
      logFrozenEntity(thrownEntity);

      gameWorld.world.removeComponent(thrownEntity, "tryThrow");
      break;
    }

    if (!throwerEntity.container) {
      console.log(`thrower: ${throwerId} has no container`);
      logFrozenEntity(thrownEntity);
      logFrozenEntity(throwerEntity);

      gameWorld.world.removeComponent(thrownEntity, "tryThrow");
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

        for (const blocker of blockingEntities) {
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
        gameWorld.world.addComponent(thrownEntity, "position", { ...position });
      }

      if (hitEntity?.health) {
        hitEntity.health.current -= 5;
        addLog(
          `${throwerEntity.name} throws ${thrownEntity.name} at ${hitEntity?.name} for 5 damage!`,
        );
      } else {
        addLog(
          `${throwerEntity.name} throws ${thrownEntity.name} at ${hitEntity?.name}`,
        );
      }
    } else {
      // put entity to be thrown on at cursor location
      const position = getState().cursor[1];
      gameWorld.world.addComponent(thrownEntity, "position", { ...position });

      addLog(`${throwerEntity.name} throws ${thrownEntity.name}`);
    }

    // remove item from dropper's inventory
    remove(throwerEntity.container.contents, (id) => thrownId === id);
    gameWorld.world.removeComponent(thrownEntity, "tryThrow");
  }
};
