import { isAtSamePosition } from "../../lib/grid";
import { addLog, colorEntityName } from "../../lib/utils";
import { IGameWorld, type Entity } from "../engine";
import { OpenState } from "../enums";
import { chars } from "../../actors/graphics";

export const createCloseSystem = (world: IGameWorld["world"]) => {
  const tryCloseQuery = world.with("tryClose");
  const openableQuery = world.with("openable");

  return function system() {
    for (const actor of tryCloseQuery) {
      // get location of target
      const position = actor.tryClose;
      let nothingToClose = true;

      for (const target of openableQuery) {
        if (!target.position) return;

        if (isAtSamePosition(target.position, position)) {
          // we have our target
          if (target.openable?.state === OpenState.Open) {
            closeDoor(target);
            addLog(
              `${colorEntityName(actor)} closes the ${colorEntityName(target)}`,
            );
            nothingToClose = false;
          }
        }
      }

      if (nothingToClose) {
        addLog("There is nothing there to close");
      }
      world.removeComponent(actor, "tryClose");
    }
  };

  function closeDoor(target: Entity) {
    world.addComponent(target, "opaque", true);
    world.addComponent(target, "blocking", true);
    if (target.appearance) {
      target.appearance.char = chars.doorClosed;
    }
    if (target.openable) {
      target.openable.state = OpenState.Closed;
    }
  }
};
