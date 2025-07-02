import { chars } from "../../actors/graphics";
import { addLog, colorEntityName } from "../../lib/utils";
import { type IGameWorld, type Entity } from "../engine";
import { OpenState } from "../enums";

export const createOpenSystem = ({ world, registry }: IGameWorld) => {
  const tryOpenQuery = world.with("tryOpen");

  return function openSystem() {
    for (const actor of tryOpenQuery) {
      const target = registry.get(actor.tryOpen.id);
      if (!target) return;

      if (target.openable?.state === OpenState.Open) {
        addLog(`${colorEntityName(target)} is open.`);
      }

      if (target.openable?.state === OpenState.Closed) {
        if (isSmartEnough(actor)) {
          openDoor(target);

          if (actor.pc) {
            addLog(
              `${colorEntityName(actor)} opens the ${colorEntityName(target)}`,
            );
          }
        } else {
          if (actor.pc) {
            addLog(
              `${colorEntityName(actor)} is not intelligent enough to open the ${colorEntityName(target)}`,
            );
          }
        }

        world.removeComponent(actor, "tryOpen");
      }

      if (target.openable?.state === OpenState.Ajar) {
        // an unintelligent thing can pass through
      }

      if (target.openable?.state === OpenState.Jammed) {
        // must be forced open or skill check to unjam
      }

      if (target.openable?.state === OpenState.Broken) {
        // must be forced open
      }

      if (target.openable?.state === OpenState.Sealed) {
        // cannot be opened by normal means (plot lock)
      }

      if (target.openable?.isLocked) {
        // locked must be opened first
      }

      if (target.openable?.isTrapped) {
        // disarm trap first or face the consequences
      }

      if (target.openable?.requiresTool) {
        // can only open with specific tool (plot lock)
      }

      if (target.openable?.isOneWay) {
        // can only open from a specific direction
      }

      if (target.openable?.isAutoClosing) {
        // will auto close after some time
      }

      if (target.openable?.isSilent) {
        // nothing until we have a sound system
      }

      if (target.openable?.hasBeenOpened) {
        // tracks if door has been opened - not really needed right now
      }
    }
  };
  function isSmartEnough(actor: Entity) {
    if (actor.intelligence && actor.intelligence > 3) {
      return true;
    }

    return false;
  }

  function openDoor(target: Entity) {
    world.removeComponent(target, "opaque");
    world.removeComponent(target, "blocking");
    if (target.openable) {
      target.openable.hasBeenOpened = true;
      target.openable.state = OpenState.Open;
    }
    if (target.appearance) {
      target.appearance.char = chars.doorOpen;
    }
  }
};
