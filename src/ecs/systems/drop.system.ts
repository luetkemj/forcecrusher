import { remove, sample } from "lodash";
import {
  colorTag,
  addLog,
  logFrozenEntity,
  updatePosition,
} from "../../lib/utils";
import { circle, toPos, toPosId } from "../../lib/grid";
import { IGameWorld } from "../engine";

export const createDropSystem = ({ world, registry }: IGameWorld) => {
  const dropQuery = world.with("tryDrop");
  const pickUpQuery = world.with("position", "pickUp");
  const blockingQuery = world.with("position", "blocking");

  return function dropSystem() {
    for (const entity of dropQuery) {
      // get dropper entity
      const dropperId = entity.tryDrop.dropperId;

      const dropperEntity = registry.get(dropperId);

      if (!dropperEntity) {
        console.log(`dropperId: ${dropperId} does not exist`);
        logFrozenEntity(entity);

        world.removeComponent(entity, "tryDrop");
        break;
      }

      // confirm item to be dropped is actually in dropper's inventory
      const entityId = entity.id;

      if (!entityId) {
        console.log(`Entity does not have an id.`);
        logFrozenEntity(entity);

        world.removeComponent(entity, "tryDrop");
        break;
      }

      if (!dropperEntity?.container?.contents.includes(entityId)) {
        console.log(`${dropperEntity.name} is not holding ${entity.name}`);
        logFrozenEntity(dropperEntity);
        logFrozenEntity(entity);

        world.removeComponent(entity, "tryDrop");
        break;
      }

      // put entity to be dropped on ground next to dropper's current location in an empty spot if possible
      const { position } = dropperEntity;
      if (!position) {
        console.log(
          `${dropperEntity.name} has no position and cannot drop ${entity.name}`,
        );
        logFrozenEntity(dropperEntity);
        logFrozenEntity(entity);

        world.removeComponent(entity, "tryDrop");
        break;
      }

      // get open locations adjacent to position
      const possibleLocations = new Set(circle(position, 2).posIds);
      for (const pickUpEntity of pickUpQuery) {
        possibleLocations.delete(toPosId(pickUpEntity.position));
      }
      for (const blockingEntity of blockingQuery) {
        possibleLocations.delete(toPosId(blockingEntity.position));
      }

      // find an open location and drop item at first found
      if (possibleLocations.size) {
        const posId = sample([...possibleLocations]);
        if (!posId) return;
        updatePosition(world, entity, { ...toPos(posId) });
      } else {
        // if no open loc, just drop at current location
        updatePosition(world, entity, position);
      }

      // remove item from dropper's inventory
      remove(dropperEntity.container.contents, (id) => entityId === id);
      world.removeComponent(entity, "tryDrop");

      const dropperTint = dropperEntity.appearance?.tint || 0x00ff00;
      const droppedTint = entity.appearance?.tint || 0x00ff00;
      addLog(
        `${colorTag(dropperTint)}${dropperEntity.name}§purple§ drops ${colorTag(droppedTint)}${entity.name}`,
      );
    }
  };
};
