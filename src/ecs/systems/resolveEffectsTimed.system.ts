import { EffectTimed, Effectable, IGameWorld } from "../engine";
import { EffectApplication } from "../enums";
import { getState } from "../gameState";

export const createResolveEffectsTimedSystem = ({ world }: IGameWorld) => {
  const effectsTimedQuery = world.with("effectsTimed");

  return function resolveEffectsTimedSystem() {
    const { currentActorId } = getState();

    for (const actor of effectsTimedQuery) {
      // only run for the actor whose turn it is
      if (actor.id !== currentActorId) continue;

      const { effectsTimed } = actor;

      for (const effect of effectsTimed) {
        // get the component
        const component = actor[effect.component];
        if (!component) continue;

        // if duration has expired
        if (hasExpired(effect)) {
          // reset to base if needed
          // TODO: this can overwrite other existing effects
          // need to reset the affects of current effect rather than just reset to base
          if (effect.resetToBaseOnExpire) {
            component.current = component.base;
          }

          continue;
        } else if (effect.hasBeenApplied) {
          if (effect.application === EffectApplication.PerTurn) {
            applyEffect(component, effect);
          }
        } else {
          applyEffect(component, effect);
        }
      }

      actor.effectsTimed = effectsTimed.filter((effect) => !hasExpired(effect));
    }
  };
};

function hasExpired(effect: EffectTimed): boolean {
  return getState().turnNumber >= effect.appliedTurn + effect.durationTurns;
}

function applyEffect(component: Effectable, effect: EffectTimed) {
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

  effect.hasBeenApplied = true;
}

function getResolvedValue(component: Effectable, effect: EffectTimed) {
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

  // When applying deltaMax, don't clamp against the old component.max,
  // otherwise positive deltas can never increase the max.
  if (!ignoreMax && applyKind !== "deltaMax") {
    next = Math.min(component.max, next);
  }

  return next;
}
