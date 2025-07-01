import { isUndefined } from "lodash";
import { addLog, colorTag, logFrozenEntity } from "../../lib/utils";
import { IGameWorld } from "../engine";

export const createPickUpSystem = ({ world, registry }: IGameWorld) => {
  const pcQuery = world.with("pc");
  const pickUpQuery = world.with("tryPickUp");

  return function system() {
    const [player] = pcQuery;

    for (const entity of pickUpQuery) {
      if (!entity.pickUp) {
        console.log(`Entity is not a pickup`);
        logFrozenEntity(entity);
        break;
      }

      const { pickerId } = entity.tryPickUp;
      const pickerEntity = registry.get(pickerId);
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

        world.removeComponent(entity, "tryPickUp");
        break;
      }

      if (container.contents.length >= container.slots) {
        console.log(`Picker has no room in container`);
        logFrozenEntity(pickerEntity);

        if (pickerEntity === player) {
          addLog(`You have no room in your ${player?.container?.name}.`);
        }

        world.removeComponent(entity, "tryPickUp");
        break;
      }

      const pickupId = entity.id;
      if (isUndefined(pickupId)) {
        console.log(`pickupId ${pickupId} does not exist`);

        world.removeComponent(entity, "tryPickUp");
        break;
      }

      // put pickUp in container
      container.contents.push(pickupId);
      world.removeComponent(entity, "tryPickUp");
      world.removeComponent(entity, "position");

      const pickerTint = pickerEntity.appearance?.tint || 0x00ff00;
      const pickedTint = entity.appearance?.tint || 0x00ff00;
      addLog(
        `${colorTag(pickerTint)}${pickerEntity.name}§purple§ puts ${colorTag(pickedTint)}${entity.name}§purple§ in ${pickerEntity?.container?.name}`,
      );
    }
  };
};
