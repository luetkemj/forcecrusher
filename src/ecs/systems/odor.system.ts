import { Pos, toPosId } from "../../lib/grid";
import { propagateField } from "../../lib/pathfinding";
import { IGameWorld } from "../engine";
import { State, getState, setState } from "../gameState";

export const createOdorSystem = (gameWorld: IGameWorld) => {
  const { world } = gameWorld;
  const odorQuery = world.with("odor", "position");
  const blockingQuery = world.with("blocking", "position");
  const pathThroughQuery = world.with("blocking", "position", "pathThrough");

  return function odorSystem() {
    // NOTE: OLFACTORY
    const odorFields = new Map<string, Map<string, { strength: number }>>(); // entityId -> odor map
    const blockingSet = new Set<string>();
    const obscuredSet = new Set<string>();

    // Decay odorMap
    for (const [posId, odors] of getState().odorMap.entries()) {
      for (const [entityId, odorObj] of Object.entries(odors)) {
        const decayed = odorObj.strength - 0.25;
        if (decayed <= 0) {
          delete odors[entityId];
        } else {
          odors[entityId] = { strength: decayed };
        }
      }

      // Remove cell entirely if no smells left
      if (Object.keys(odors).length === 0) {
        setState((state: State) => {
          state.odorMap.delete(posId);
        });
      }
    }

    for (const entity of blockingQuery) {
      blockingSet.add(toPosId(entity.position));
    }

    for (const entity of pathThroughQuery) {
      obscuredSet.add(toPosId(entity.position));
    }

    for (const actor of odorQuery) {
      const field = propagateField(
        actor.position,
        actor.odor.strength,
        (pos: Pos) => {
          return blockingSet.has(toPosId(pos));
        },
        (pos: Pos) => {
          return obscuredSet.has(toPosId(pos));
        },
        true, // asObject: return { strength } objects
      ) as Map<string, { strength: number }>;

      for (const [posId, obj] of field) {
        const { odorMap } = getState();
        // Ensure the position exists in the map
        if (!odorMap.has(posId)) {
          setState((state: State) => {
            state.odorMap.set(posId, { [actor.id]: { strength: 0 } });
          });
        }
        // Ensure the actor id exists in the map at this position
        if (!odorMap.get(posId)![actor.id]) {
          setState((state: State) => {
            state.odorMap.get(posId)![actor.id] = { strength: 0 };
          });
        }
        odorMap.get(posId)![actor.id].strength = Math.max(
          obj.strength,
          odorMap.get(posId)![actor.id].strength ?? 0,
        );
      }

      odorFields.set(actor.id, field);
    }
  };
};
