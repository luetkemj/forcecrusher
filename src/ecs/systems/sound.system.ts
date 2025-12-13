import { Pos, toPosId } from "../../lib/grid";
import { propagateField } from "../../lib/pathfinding";
import { IGameWorld } from "../engine";
import { State, getState, setState } from "../gameState";

export const createSoundSystem = (gameWorld: IGameWorld) => {
  const { world } = gameWorld;
  const soundQuery = world.with("sound", "position").without("paused");
  const blockingQuery = world.with("blocking", "position").without("paused");
  const pathThroughQuery = world
    .with("blocking", "position", "pathThrough")
    .without("paused");

  return function soundSystem() {
    // NOTE: OLFACTORY
    const soundFields = new Map<string, Map<string, { strength: number }>>(); // entityId -> sound map
    const blockingSet = new Set<string>();
    const obscuredSet = new Set<string>();

    // Decay odorMap
    for (const [posId, sounds] of getState().soundMap.entries()) {
      for (const [entityId, { strength }] of Object.entries(sounds)) {
        const decayed = strength - 50;
        if (decayed <= 0) {
          delete sounds[entityId];
        } else {
          sounds[entityId].strength = decayed;
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
        true, // asObject: return { strength } objects
      ) as Map<string, { strength: number }>;

      for (const [posId, obj] of field) {
        const { soundMap } = getState();
        // Ensure the position exists in the map
        if (!soundMap.has(posId)) {
          setState((state: State) => {
            state.soundMap.set(posId, { [actor.id]: { strength: 0 } });
          });
        }
        // Ensure the actor id exists in the map at this position
        if (!soundMap.get(posId)![actor.id]) {
          setState((state: State) => {
            state.soundMap.get(posId)![actor.id] = { strength: 0 };
          });
        }
        soundMap.get(posId)![actor.id].strength = Math.max(
          obj.strength,
          soundMap.get(posId)![actor.id].strength ?? 0,
        );
      }

      soundFields.set(actor.id, field);

      world.removeComponent(actor, "sound");
    }
  };
};
