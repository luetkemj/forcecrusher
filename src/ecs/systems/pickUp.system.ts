import { isUndefined } from "lodash";
import { addLog, logFrozenEntity } from "../../lib/utils";
import { world } from "../engine";

const pcEntities = world.with('pc');
const entitiesBeingPickedUp = world.with("tryPickUp");

export const pickUpSystem = () => {
  const [player] = pcEntities

  for (const entity of entitiesBeingPickedUp) {
    if (!entity.pickUp) {
      console.log(`Entity is not a pickup`);
      logFrozenEntity(entity);
      break;
    }

    const { pickerId } = entity.tryPickUp;
    const pickerEntity = world.entity(pickerId);
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

      world.removeComponent(entity, 'tryPickUp')
      break;
    }

    if (container.contents.length >= container.slots) {
      console.log(`Picker has no room in container`);
      logFrozenEntity(pickerEntity);

      if (pickerEntity === player) {
        addLog(`You have no room in your ${player?.container?.name}.`);
      }

      world.removeComponent(entity, 'tryPickUp')
      break;
    }

    const pickupId = world.id(entity);
    if (isUndefined(pickupId)) {
      console.log(`pickupId ${pickupId} does not exist`);

      world.removeComponent(entity, 'tryPickUp')
      break;
    }

    // put pickUp in container
    container.contents.push(pickupId);
    world.removeComponent(entity, 'tryPickUp')
    world.removeComponent(entity, 'position')

    addLog(
      `${pickerEntity.name} puts ${entity.name} in ${pickerEntity?.container?.name}`
    );
  }
};
