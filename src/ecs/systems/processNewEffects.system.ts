import { IGameWorld } from "../engine";
import { EffectMode, EffectStackPolicy } from "../enums";
import { getState } from "../gameState";

export const createProcessNewEffectsSystem = ({ world }: IGameWorld) => {
  const effectsQuery = world.with("effectsToProcess");

  return function processNewEffectsSystem() {
    const { currentActorId, turnNumber } = getState();

    for (const actor of effectsQuery) {
      // only run for the actor whose turn it is
      if (actor.id !== currentActorId) continue;
      const { effectsToProcess } = actor;

      while (effectsToProcess.length > 0) {
        const effect = effectsToProcess.pop();
        if (!effect) continue;

        // process effect
        if (effect.mode === EffectMode.Instant) {
          if (!actor.effectsInstants) continue;

          actor.effectsInstants.push(effect);

          continue;
        }

        if (effect.mode === EffectMode.Timed) {
          if (!actor.effectsTimed) continue;

          const existingEffect = actor.effectsTimed.find(
            (e) => e.id === effect.id,
          );

          if (existingEffect) {
            if (effect.stackPolicy === EffectStackPolicy.Additive) {
              effect.appliedTurn = turnNumber;
              actor.effectsTimed.push(effect);
            }

            if (effect.stackPolicy === EffectStackPolicy.RefreshDuration) {
              existingEffect.appliedTurn = turnNumber;
            }
          } else {
            effect.appliedTurn = turnNumber;
            actor.effectsTimed.push(effect);
          }

          continue;
        }
      }
    }
  };
};
