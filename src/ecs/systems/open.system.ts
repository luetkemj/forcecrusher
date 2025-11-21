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

      if (target.openable?.isLocked) {
        addLog(`${colorEntityName(target)} is locked.`);
        // locked must be opened first
        // key with id to match door with id
        // can be picked with tool
        // can be broken with force
        return world.removeComponent(actor, "tryOpen");
      }

      if (target.openable?.state === OpenState.Open) {
        addLog(`${colorEntityName(target)} is open.`);
        return world.removeComponent(actor, "tryOpen");
      }

      if (target.openable?.state === OpenState.Closed) {
        if (isSmartEnough(actor, target)) {
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
        return world.removeComponent(actor, "tryOpen");
      }

      if (target.openable?.state === OpenState.Ajar) {
        // an unintelligent thing can pass through
        openDoor(target);

        if (actor.pc) {
          addLog(
            `${colorEntityName(actor)} pushes through the open ${colorEntityName(target)}`,
          );
        }

        return world.removeComponent(actor, "tryOpen");
      }

      if (target.openable?.state === OpenState.Jammed) {
        // must be forced open or skill check to unjam
        // strength check to force open (very loud)
        // carpenter's tool and an intelligence check to unjam
        if (isStrongEnough(actor, target)) {
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
        return world.removeComponent(actor, "tryOpen");
      }

      if (target.openable?.state === OpenState.Broken) {
        // must be forced open
        // strenth check to
      }

      if (target.openable?.state === OpenState.Sealed) {
        // cannot be opened by normal means (plot lock)
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

  function isSmartEnough(actor: Entity, target: Entity) {
    if (target.openable?.state === OpenState.Closed) {
      if (actor.intelligence && actor.intelligence > 3) {
        return true;
      }
    }
    if (target.openable?.state === OpenState.Jammed) {
      if (actor.intelligence && actor.intelligence > 15) {
        return true;
      }
    }

    return false;
  }

  function isStrongEnough(actor: Entity, target: Entity) {
    if (target.openable?.state === OpenState.Ajar) {
      if (actor.strength && actor.strength > 3) {
        return true;
      }
    }

    if (target.openable?.state === OpenState.Jammed) {
      if (actor.strength && actor.strength > 3) {
        return true;
      }
    }
  }

  function openDoor(target: Entity) {
    world.removeComponent(target, "opaque");
    world.removeComponent(target, "blocking");
    if (target.openable) {
      target.openable.hasBeenOpened = true;
      target.openable.state = OpenState.Open;
    }
  }
};
