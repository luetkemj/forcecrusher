import { random } from "lodash";
import { addLog, colorEntityName } from "../../lib/utils";
import { IGameWorld } from "../engine";

export const createKickSystem = (
  world: IGameWorld["world"],
  registry: IGameWorld["registry"],
) => {
  const tryKickQuery = world.with("tryKick");

  return function system() {
    for (const actor of tryKickQuery) {
      const { targetId } = actor.tryKick;
      const target = registry.get(targetId);
      if (!target) return;

      if (target.kickable) {
        // get actor position
        const actorPosition = actor.position;
        const targetPosition = target.position;
        if (!actorPosition || !targetPosition) return;
        // get direction
        // draw line
        // move until you hit something
        // stop in front of thing
        // damage thing
        if (target.kickable.immovable) {
          if (target.kickable.maxDamageOnKick) {
            // TODO: if wearing boots or similar, reduce damage
            const damage = random(1, target.kickable.maxDamageOnKick);
            // TODO: this should be in a system (not Damage, cause that assumes a weapon attack... unless I can make that work for this too... which would be ideal)
            if (actor.health) {
              actor.health.current -= damage;
            }

            addLog(
              `§red§Ouch! ${colorEntityName(actor)}§red§ kicks the ${colorEntityName(target)}§red§ for ${damage}hp!`,
            );
          }
        }
      } else {
        console.log("unkickable", target);
      }

      // remove item from dropper's inventory
      world.removeComponent(actor, "tryKick");
    }
  };
};
