import { isUndefined } from "lodash";
import { addLog, logFrozenEntity } from "../../lib/utils";
import { gameWorld } from "../engine";

const pcEntities = gameWorld.world.with("pc");
const entitiesBeingPickedUp = gameWorld.world.with("tryPickUp");

export const pickUpSystem = () => {
  const [player] = pcEntities;

  for (const entity of entitiesBeingPickedUp) {
    if (!entity.pickUp) {
      console.log(`Entity is not a pickup`);
      logFrozenEntity(entity);
      break;
    }

    const { pickerId } = entity.tryPickUp;
    const pickerEntity = gameWorld.world.entity(pickerId);
    if (!pickerEntity) {
      console.log(`pickerId ${pickerId} does not exist`);
      break;
    }

    const { container } = pickerEntity;
    if (!container) {
      console.log(`Picker has no container`);
      logFrozenEntity(pickerEntity);

      if (pickerEntity === player) {
        addLog(`You have nowhere to put that.`);
      }

      gameWorld.world.removeComponent(entity, "tryPickUp");
      break;
    }

    if (container.contents.length >= container.slots) {
      console.log(`Picker has no room in container`);
      logFrozenEntity(pickerEntity);

      if (pickerEntity === player) {
        addLog(`You have no room in your ${player?.container?.name}.`);
      }

      gameWorld.world.removeComponent(entity, "tryPickUp");
      break;
    }

    const pickupId = gameWorld.world.id(entity);
    if (isUndefined(pickupId)) {
      console.log(`pickupId ${pickupId} does not exist`);

      gameWorld.world.removeComponent(entity, "tryPickUp");
      break;
    }

    // put pickUp in container
    container.contents.push(pickupId);
    gameWorld.world.removeComponent(entity, "tryPickUp");
    gameWorld.world.removeComponent(entity, "position");

    addLog(
      `${pickerEntity.name} puts ${entity.name} in ${pickerEntity?.container?.name}`,
    );
  }
};
