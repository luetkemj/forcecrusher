import { remove } from "lodash";
import { addLog, logFrozenEntity } from "../../lib/utils";
import { gameWorld } from "../engine";

export const dropSystem = () => {
  const tryDropEntities = gameWorld.world.with("tryDrop");
  for (const entity of tryDropEntities) {
    // get dropper entity
    const dropperId = entity.tryDrop.dropperId;

    const dropperEntity = gameWorld.registry.get(dropperId);

    if (!dropperEntity) {
      console.log(`dropperId: ${dropperId} does not exist`);
      logFrozenEntity(entity);

      gameWorld.world.removeComponent(entity, "tryDrop");
      break;
    }

    // confirm item to be dropped is actually in dropper's inventory
    const entityId = entity.id;

    if (!entityId) {
      console.log(`Entity does not have an id.`);
      logFrozenEntity(entity);

      gameWorld.world.removeComponent(entity, "tryDrop");
      break;
    }

    if (!dropperEntity?.container?.contents.includes(entityId)) {
      console.log(`${dropperEntity.name} is not holding ${entity.name}`);
      logFrozenEntity(dropperEntity);
      logFrozenEntity(entity);

      gameWorld.world.removeComponent(entity, "tryDrop");
      break;
    }

    // put entity to be dropped on ground at dropper's current location
    const { position } = dropperEntity;
    if (!position) {
      console.log(
        `${dropperEntity.name} has no position and cannot drop ${entity.name}`,
      );
      logFrozenEntity(dropperEntity);
      logFrozenEntity(entity);

      gameWorld.world.removeComponent(entity, "tryDrop");
      break;
    }

    gameWorld.world.addComponent(entity, "position", { ...position });

    // remove item from dropper's inventory
    remove(dropperEntity.container.contents, (id) => entityId === id);
    gameWorld.world.removeComponent(entity, "tryDrop");

    addLog(`${dropperEntity.name} drops ${entity.name}`);
  }
};
