import { EffectInstant, Effectable, IGameWorld } from "../engine";
import { getState } from "../gameState";

export const createResolveEffectsPendingInstantsSystem = ({
  world,
}: IGameWorld) => {
  const effectsPendingInstantsQuery = world.with("effectsPendingInstants");

  return function resolveEffectsPendingInstantsSystem() {
    const { currentActorId } = getState();

    // this should be scoped to current actor
    for (const actor of effectsPendingInstantsQuery) {
      // only run AI for the actor whose turn it is
      if (actor.id !== currentActorId) continue;
      const { effectsPendingInstants } = actor;

      for (const effect of effectsPendingInstants) {
        const component = actor[effect.component];
        if (!component) continue;

        // resolve the effect
        if (effect.applyKind === "deltaCurrent") {
          component.current = getResolvedValue(component, effect);
        }

        if (effect.applyKind === "deltaBase") {
          component.base = getResolvedValue(component, effect);
        }

        if (effect.applyKind === "deltaMax") {
          component.max = getResolvedValue(component, effect);
        }
      }

      effectsPendingInstants.splice(0, effectsPendingInstants.length);
    }
  };
};

function getResolvedValue(component: Effectable, effect: EffectInstant) {
  const { applyKind, delta, ignoreMax, ignoreMin } = effect;

  let next = 0;

  if (applyKind === "deltaCurrent") {
    next = component.current + delta;
  }

  if (applyKind === "deltaBase") {
    next = component.base + delta;
  }

  if (applyKind === "deltaMax") {
    next = component.max + delta;
  }

  if (!ignoreMin) {
    next = Math.max(component.min, next);
  }

  if (!ignoreMax) {
    next = Math.min(component.max, next);
  }

  return next;
}
