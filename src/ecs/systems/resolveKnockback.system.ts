import { tail } from "lodash";
import { IGameWorld, Entity } from "../engine";
import { EffectType } from "../enums";
import { Pos, getDirection, line, moveInDirection } from "../../lib/grid";
import { isSamePosition } from "../../lib/utils";
import { rangeAttack } from "../../lib/combat";

export const createResolveKnockbackSystem = ({ world, registry }: IGameWorld) => {
  const resolveKnockbackQuery = world.with("tryKnockback");
  const blockingQuery = world.with("blocking", "position");

  return function resolveKnockbackSystem() {
    for (const target of resolveKnockbackQuery) {
      const { actorId, distance } = target.tryKnockback;
      const actor = registry.get(actorId);
      if (!actor) return;

      if (target.effectImmunities?.includes(EffectType.Knockback)) return;

      if (distance) {
        // get direction (actor to target)
        if (actor.position && target.position) {
          const direction = getDirection(target.position, actor.position);
          const landingZone = moveInDirection(
            target.position,
            direction,
            distance,
          );

          let hitEntity: Entity | undefined;
          let restingPosition: Pos | undefined;
          let blocked = false;

          const throwLine = line(target.position, landingZone);
          // check for blocker along throwline
          for (let i = 0; i < tail(throwLine).length; i++) {
            const value = tail(throwLine)[i];

            for (const blocker of blockingQuery) {
              if (isSamePosition(blocker.position, value)) {
                blocked = true;
                hitEntity = blocker;
                restingPosition = throwLine[i];
                break;
              }
            }

            if (blocked) break;
          }

          if (blocked) {
            // put entity to be thrown on at cursor location
            const position = restingPosition;
            if (position) {
              target.position = { ...position };
            }

            if (hitEntity?.health) {
              rangeAttack(actor, hitEntity, target);
            }
          } else {
            // put entity to be thrown on at cursor location
            target.position = { ...landingZone };
          }
        }
      }

      world.removeComponent(target, "tryKnockback");
    }
  };
};
