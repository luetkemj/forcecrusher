import { remove } from "lodash";
import { getState } from "../../main";
import { addLog, logFrozenEntity } from "../../lib/utils";
import { world } from "../engine";
import { line } from "../../lib/grid";

const tryThrowEntities = world.with("tryThrow");

export const throwSystem = () => {
  for (const entity of tryThrowEntities) {
    // get thrower entity
    const { throwerId } = entity.tryThrow;
    const thrownId = world.id(entity);

    const throwerEntity = world.entity(throwerId);
    const thrownEntity = entity;

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

    // put entity to be thrown on at cursor location
    const position = getState().cursor[1];

    // if we throw items that already have a position (kicking) this won't work cause addComponent doesn't overwrite existing components
    world.addComponent(thrownEntity, "position", { ...position });

    // remove item from dropper's inventory
    remove(throwerEntity.container.contents, (id) => thrownId === id);
    world.removeComponent(thrownEntity, "tryThrow");

    addLog(`${throwerEntity.name} throws ${thrownEntity.name}`);
  }
};
