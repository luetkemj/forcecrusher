import { Pos, toPosId } from "../../lib/grid";
import { propagateField } from "../../lib/pathfinding";
import { IGameWorld } from "../engine";
import { State, getState, setState } from "../gameState";

export const createSoundSystem = (gameWorld: IGameWorld) => {
  const { world } = gameWorld;
  const soundQuery = world.with("sound", "position");
  const blockingQuery = world.with("blocking", "position");
  const pathThroughQuery = world.with("blocking", "position", "pathThrough");

  return function soundSystem() {
    // NOTE: OLFACTORY
    const soundFields = new Map<string, Map<string, number>>(); // entityId -> odor map
    const blockingSet = new Set<string>();
    const obscuredSet = new Set<string>();

    // Decay odorMap
    for (const [posId, sounds] of getState().soundMap.entries()) {
      for (const [entityId, strength] of Object.entries(sounds)) {
        const decayed = strength - 50;
        if (decayed <= 0) {
          delete sounds[entityId];
        } else {
          sounds[entityId] = decayed;
        }
      }

      // Remove cell entirely if no smells left
      if (Object.keys(sounds).length === 0) {
        setState((state: State) => {
          state.soundMap.delete(posId);
        });
      }
    }

    for (const entity of blockingQuery) {
      blockingSet.add(toPosId(entity.position));
    }

    for (const entity of pathThroughQuery) {
      obscuredSet.add(toPosId(entity.position));
    }

    for (const actor of soundQuery) {
      const field = propagateField(
        actor.position,
        actor.sound.strength,
        (pos: Pos) => {
          return blockingSet.has(toPosId(pos));
        },
        (pos: Pos) => {
          return obscuredSet.has(toPosId(pos));
        },
      );

      for (const [posId, strength] of field) {
        const { soundMap } = getState();
        if (!soundMap.has(posId)) {
          setState((state: State) => {
            state.soundMap.set(posId, {});
          });
        }

        soundMap.get(posId)![actor.id] = Math.max(
          strength,
          soundMap.get(posId)![actor.id] ?? 0,
        );
      }

      soundFields.set(actor.id, field);

      world.removeComponent(actor, "sound");
    }
  };
};
