import { random } from "lodash";
import { IGameWorld } from "../engine";
import { DamageType } from "../enums";

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
        const actorPosition = actor.position;
        const targetPosition = target.position;
        if (!actorPosition || !targetPosition) return;

        // Immovable = actor takes damage
        if (target.kickable.immovable) {
          if (target.kickable.maxDamageOnKick) {
            const damageAmount = random(1, target.kickable.maxDamageOnKick);

            const damage = {
              attacker: null,
              instigator: actor.id,
              responder: target.id,
              target: actor.id,
              reason: `kicked ${target.name}`,
              critical: false,
              damageAmounts: [
                {
                  type: DamageType.Bludgeoning,
                  amount: damageAmount,
                  mod: 0,
                },
              ],
            };

            if (!actor.damages) actor.damages = [];
            actor.damages.push(damage);
          }
        }

        // TODO: handle knockback, noise, breakage, etc.
      } else {
        console.log("unkickable", target);
      }

      world.removeComponent(actor, "tryKick");
    }
  };
};
