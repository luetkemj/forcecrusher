import { EffectInstant, Effectable, IGameWorld } from "../engine";
import { EffectMode, EffectStackPolicy } from "../enums";
import { getState } from "../gameState";

export const createProcessNewEffectsSystem = ({ world }: IGameWorld) => {
  const effectsQuery = world.with("effectsToProcess");

  return function processNewEffectsSystem() {
    const { currentActorId } = getState();

    for (const actor of effectsQuery) {
      // only run for the actor whose turn it is
      if (actor.id !== currentActorId) continue;
      const { effectsToProcess } = actor;

      for (const effect of effectsToProcess) {
        if (effect.mode === EffectMode.Instant) {
          if (!actor.effectsInstants) continue;

          actor.effectsInstants.push(effect);
        }

        if (effect.mode === EffectMode.Timed) {
          if (!actor.effectsTimed) continue;

          const existingEffect = actor.effectsTimed.find(
            (e) => e.id === effect.id,
          );

          if (existingEffect) {
            if (effect.stackPolicy === EffectStackPolicy.Additive) {
              actor.effectsTimed.push(effect);
            }

            if (effect.stackPolicy === EffectStackPolicy.RefeshDuration) {
              existingEffect.appliedTurn = getState().turnNumber;
            }
          } else {
            effect.appliedTurn = getState().turnNumber;
            if (actor.effectsTimed) {
              actor.effectsTimed.push(effect);
            }
          }
        }

        effectsToProcess.splice(0, effectsToProcess.length);
      }

      // if instant - push effect to instants array
      // if timed - check stack policy and resolve accordingly
      // delete effect from effects component
      //
      //
      // if (
      //   effect.mode === EffectMode.Instant &&
      //   player.effectsPendingInstants
      // ) {
      //   player.effectsPendingInstants.push(effect);
      // }
      // if (effect.mode === EffectMode.Timed && player.effectsActiveTimed) {
      //   // set effect timers
      //   effect.appliedTurn = getState().turnNumber;
      //   player.effectsActiveTimed.push(effect);
      // }
    }
  };
};
