import { chars } from "../../actors/graphics";
import { addLog, colorEntityName } from "../../lib/utils";
import { type IGameWorld } from "../engine";

export const createDoorSystem = (
  world: IGameWorld["world"],
  registry: IGameWorld["registry"],
) => {
  const tryOpenQuery = world.with("tryOpenDoor");

  return function system() {
    for (const opener of tryOpenQuery) {
      const door = registry.get(opener.tryOpenDoor.doorId);
      if (!door) return;

      // can opener open the door?
      if (opener.intelligence && opener.intelligence > 3) {
        // can open door
        world.addComponent(door, "open", true);
        world.removeComponent(door, "opaque");
        world.removeComponent(door, "blocking");
        if (door.appearance) {
          door.appearance.char = chars.doorOpen;
        }

        if (opener.pc) {
          addLog(
            `${colorEntityName(opener)} opens the ${colorEntityName(door)}`,
          );
        }
      } else {
        // cannot open door
        if (opener.pc) {
          addLog(
            `${colorEntityName(opener)} is not intelligent enough to open the ${colorEntityName(door)}`,
          );
        }
      }

      world.removeComponent(opener, "tryOpenDoor");
    }
  };
};
