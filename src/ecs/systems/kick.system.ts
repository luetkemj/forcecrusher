import { random } from "lodash";
import { IGameWorld } from "../engine";
import { DamageType } from "../enums";

export const createKickSystem = ({ world, registry }: IGameWorld) => {
  const tryKickQuery = world.with("tryKick").without("excludeFromSim");

  return function kickSystem() {
    for (const actor of tryKickQuery) {
      const { targetId } = actor.tryKick;
      const target = registry.get(targetId);
      if (!target) return;

      if (target.kickable) {
        const actorPosition = actor.position;
        const targetPosition = target.position;
        if (!actorPosition || !targetPosition) return;

        // breakable is no good - cause it's odd thing to add
        if (target.kickable.breakable) {
          const kickAttack = actor.attacks?.find(
            (attack) => attack.name === "Kick",
          );

          if (kickAttack) {
            world.addComponent(actor, "tryAttack", {
              targetId: target.id,
              attack: kickAttack,
              immovableTarget: target.kickable.immovable,
            });
          }
        }

        if (target.kickable.harmfulToKicker) {
        }

        // Immovable = actor takes damage
        if (target.kickable.immovable) {
          // TODO: use a damage roll and roll attack damage (like in the attack system)
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

        if (target.kickable.isTrapped) {
        }

        if (target.kickable.noiseLevel) {
          world.addComponent(target, "sound", {
            strength: target.kickable.noiseLevel,
          });
        }

        // TODO: handle knockback, noise, breakage, etc.
      } else {
        console.log("unkickable", target);
      }

      world.removeComponent(actor, "tryKick");
    }
  };
};
