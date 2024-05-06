import { remove } from "lodash";
import { getState } from "../../main";
import { addLog, logFrozenEntity } from "../../lib/utils";
import { world } from "../engine";

const tryThrowEntities = world.with("tryThrow");

export const throwSystem = () => {
  for (const entity of tryThrowEntities) {
    // get thrower entity
    const { throwerId } = entity.tryThrow;
    const entityId = world.id(entity);

    const throwerEntity = world.entity(throwerId);

    if (!throwerEntity) {
      console.log(`dropperId: ${throwerId} does not exist`);
      logFrozenEntity(entity);

      world.removeComponent(entity, "tryThrow");
      break;
    }

    if (!throwerEntity.container) {
      console.log(`thrower: ${throwerId} has no container`);
      logFrozenEntity(entity);
      logFrozenEntity(throwerEntity);

      world.removeComponent(entity, "tryThrow");
      break;
    }


    // put entity to be thrown on at cursor location
    const position = getState().cursor[1];

    // if we throw items that already have a position (kicking) this won't work cause addComponent doesn't overwrite existing components
    world.addComponent(entity, "position", { ...position });

    // remove item from dropper's inventory
    remove(throwerEntity.container.contents, (id) => entityId === id);
    world.removeComponent(entity, "tryThrow");

    addLog(`${throwerEntity.name} throws ${entity.name}`);
  }
};
