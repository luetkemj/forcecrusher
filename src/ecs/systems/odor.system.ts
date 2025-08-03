import { Pos, toPosId } from "../../lib/grid";
import { propagateSmell } from "../../lib/pathfinding";
import { IGameWorld } from "../engine";
import { State, getState, setState } from "../gameState";

export const createOdorSystem = (gameWorld: IGameWorld) => {
  const { world } = gameWorld;
  const odorQuery = world.with("odor", "position");
  const blockingQuery = world.with("blocking", "position");
  const pathThroughQuery = world.with("blocking", "position", "pathThrough");

  return function odorSystem() {
    // NOTE: OLFACTORY
    const odorFields = new Map<string, Map<string, number>>(); // entityId -> odor map
    const blockingSet = new Set<string>();
    const obscuredSet = new Set<string>();

    // Decay odorMap
    for (const [posId, odors] of getState().odorMap.entries()) {
      for (const [entityId, strength] of Object.entries(odors)) {
        const decayed = strength - 0.1;
        if (decayed <= 0) {
          delete odors[entityId];
        } else {
          odors[entityId] = decayed;
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

    for (const entity of odorQuery) {
      const field = propagateSmell(
        entity.position,
        entity.odor.strength,
        (pos: Pos) => {
          return blockingSet.has(toPosId(pos));
        },
        (pos: Pos) => {
          return obscuredSet.has(toPosId(pos));
        },
      );

      for (const [posId, strength] of field) {
        const { odorMap } = getState();
        if (!odorMap.has(posId)) {
          setState((state: State) => {
            state.odorMap.set(posId, {});
          });
        }

        odorMap.get(posId)![entity.id] = Math.max(
          strength,
          odorMap.get(posId)![entity.id] ?? 0,
        );
      }

      odorFields.set(entity.id, field);
    }
  };
};
