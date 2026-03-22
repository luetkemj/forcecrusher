import { EffectTimed, Effectable, IGameWorld } from "../engine";
import { EffectStackPolicy } from "../enums";
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
        // need an id that is used to check if a hast potion has already been consumed
        // ids are more like names - they are unique to the effect kind but not unique to the world
        // need to check at consumption if an existing effect already exists and then adjust that one instead of adding stacks (unless they stack)

        // if duration has expired
        if (hasExpired(effect)) {
          // reset to base if needed
          if (effect.resetToBaseOnExpire) {
            component.current = component.base;
          }

          // remove effect
          effectsTimed.splice(0, effectsTimed.length);
        } else if (hasBeenApplied(effect)) {
          if (effect.stackPolicy === EffectStackPolicy.Additive) {
            applyEffect(component, effect);
          }
        } else {
          applyEffect(component, effect);
        }
      }
    }
  };
};

function hasExpired(effect: EffectTimed): boolean {
  return getState().turnNumber > effect.appliedTurn + effect.durationTurns;
}

function hasBeenApplied(effect: EffectTimed): boolean {
  return getState().turnNumber > effect.appliedTurn + 1;
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

  if (!ignoreMax) {
    next = Math.min(component.max, next);
  }

  return next;
}
