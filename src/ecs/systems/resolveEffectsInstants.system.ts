import { EffectInstant, Effectable, IGameWorld } from "../engine";
import { getState } from "../gameState";

export const createResolveEffectsInstantsSystem = ({ world }: IGameWorld) => {
  const effectsInstantsQuery = world.with("effectsInstants");

  return function resolveEffectsInstantsSystem() {
    const { currentActorId } = getState();

    for (const actor of effectsInstantsQuery) {
      // only run for the actor whose turn it is
      if (actor.id !== currentActorId) continue;
      const { effectsInstants } = actor;

      for (const effect of effectsInstants) {
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

      effectsInstants.length = 0;
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

  // When applying deltaMax, we're updating component.max itself,
  // so don't clamp against the old component.max value.
  if (!ignoreMax && applyKind !== "deltaMax") {
    next = Math.min(component.max, next);
  }

  return next;
}
