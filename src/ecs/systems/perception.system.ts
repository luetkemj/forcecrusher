import { compact, flatMap } from "lodash";
import createFOV from "../../lib/fov";
import { getNeighbors, toPosId } from "../../lib/grid";
import { addSenseLog } from "../../lib/utils";
import { Constants } from "../../pcgn/constants";
import { DetectedOdor, Entity, EntityId, IGameWorld } from "../engine";
import { State, getState, setState } from "../gameState";

export const createPerceptionSystem = (gameWorld: IGameWorld) => {
  const { world, registry } = gameWorld;
  const aiQuery = world.with("ai");
  const opaqueQuery = world.with("opaque", "position");
  const renderableQuery = world.with("appearance", "position");
  const noseQuery = world.with("nose", "position", "ai");

  return function perceptionSystem() {
    setState((state: State) => (state.visionMap = []));
    for (const actor of aiQuery) {
      // NOTE: VISION
      if (actor.vision && actor.position) {
        actor.vision.visible = [];

        const FOV = createFOV(
          opaqueQuery,
          74, // map width
          39, // map height
          actor.position,
          actor.vision.range,
        );

        setState((state: State) =>
          state.visionMap.push({ fov: FOV.fov, canSeePc: false }),
        );

        for (const target of renderableQuery) {
          if (FOV.fov.has(toPosId(target.position))) {
            actor.vision?.visible.push(target.id);
          }
        }
      }
    }

    // NOTE: OLFACTORY
    const player = registry.get(getState().playerId);
    const odorMap = getState().odorMap;
    if (player && player.position) {
      // get player position
      const posId = toPosId(player.position);
      // find smells at position
      const odors = odorMap.get(posId);
      if (!odors) return addSenseLog("", "smell");
      const smell = getStrongestOdor(odors, getState().playerId);

      if (smell) {
        processPlayerDetectedSmells(smell, gameWorld);
      }
    }

    for (const actor of noseQuery) {
      // get smells in immediate vicinity - story in memory
      const { position } = actor;
      const neighbors = getNeighbors(
        position,
        "cardinal",
        { width: Constants.dungeonWidth, height: Constants.dungeonHeight },
        true,
      ) as string[];
      const { odorMap } = getState();
      const detectedSmells = processAiSmells(neighbors, odorMap, actor);
      actor.nose.detected = flatMap(detectedSmells);
    }
  };
};

function getStrongestOdor(odors: Record<EntityId, number>, playerId: EntityId) {
  return Object.entries(odors)
    .filter(([entityId]) => entityId !== playerId) // remove player
    .sort((a, b) => b[1] - a[1])[0]; // sort by strength descending // get the strongest (or undefined if empty)
}

interface Smell {
  0: EntityId;
  1: number;
}

function processPlayerDetectedSmells(
  smell: Smell,
  gameWorld: IGameWorld,
): void {
  const entityId = smell[0];
  const strength = smell[1];
  const entity = gameWorld.registry.get(entityId) as Entity | undefined;
  if (entity) {
    if (strength >= 8) {
      return addSenseLog(`Intense smell of ${entity.name}`, "smell");
    }
    if (strength >= 6) {
      return addSenseLog(`Strong smell of ${entity.name}`, "smell");
    }
    if (strength >= 4) {
      return addSenseLog(`Noticable smell of ${entity.name}`, "smell");
    }
    if (strength >= 2) {
      return addSenseLog(`Mild smell of ${entity.name}`, "smell");
    }
    if (strength >= 1) {
      return addSenseLog(`Faint smell of ${entity.name}`, "smell");
    }
    if (strength > 0) {
      return addSenseLog(`Trace smell of ${entity.name}`, "smell");
    }
  }
}

function processAiSmells(
  neighbors: string[],
  odorMap: Map<string, Record<EntityId, number>>,
  actor: Entity,
): DetectedOdor[][] {
  return compact(
    neighbors.map((posId: string) => {
      const odors = odorMap.get(posId);
      if (odors) {
        const odorArray: (DetectedOdor | undefined)[] = Object.entries(
          odors,
        ).map(([eId, strength]) => {
          // don't detect own odor
          if (eId !== actor.id) {
            return {
              eId,
              strength,
              posId,
            };
          }
        });

        return compact(odorArray);
      }
    }),
  );
}
