import { addLog, colorEntityName } from "../../lib/utils";
import { IGameWorld, type Entity } from "../engine";
import { OpenState } from "../enums";
import { chars } from "../../actors/graphics";

export const createCloseSystem = ({ world }: IGameWorld) => {
  const tryCloseQuery = world.with("tryClose");

  return function closeSystem() {
    for (const actor of tryCloseQuery) {
      const target = actor.tryClose;

      if (target.openable?.state === OpenState.Open) {
        closeDoor(target);
        addLog(
          `${colorEntityName(actor)} closes the ${colorEntityName(target)}`,
        );
      } else {
        addLog(`${colorEntityName(target)} cannot be closed.`);
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
