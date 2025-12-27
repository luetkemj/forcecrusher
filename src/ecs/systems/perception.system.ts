import { compact, flatMap } from "lodash";
import createFOV from "../../lib/fov";
import { getNeighbors, toPosId } from "../../lib/grid";
import { addSenseLog } from "../../lib/utils";
import { Constants } from "../../pcgn/constants";
import {
  DetectedOdor,
  DetectedSound,
  Entity,
  EntityId,
  IGameWorld,
} from "../engine";
import { State, getState, setState } from "../gameState";

export const createPerceptionSystem = (gameWorld: IGameWorld) => {
  const { world, registry } = gameWorld;
  const aiQuery = world.with("ai").without("excludeFromSim");
  const opaqueQuery = world
    .with("opaque", "position")
    .without("excludeFromSim");
  const renderableQuery = world
    .with("appearance", "position")
    .without("excludeFromSim");
  const noseQuery = world
    .with("nose", "position", "ai")
    .without("excludeFromSim");
  const earsQuery = world
    .with("ears", "position", "ai")
    .without("excludeFromSim");

  return function perceptionSystem() {
    setState((state: State) => (state.visionMap = []));
    const player = registry.get(getState().playerId);

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
    const odorMap = getState().odorMap;
    if (player && player.position) {
      // get player position
      const posId = toPosId(player.position);
      // find smells at position
      const odors = odorMap.get(posId);
      if (!odors) return addSenseLog("", "smell");
      const smell = getStrongestOdor(odors, getState().playerId);

      processPlayerDetectedSmells(smell, gameWorld);
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

    // NOTE: AUDITORY
    const soundMap = getState().soundMap;
    if (player && player.position) {
      // get player position
      const posId = toPosId(player.position);
      // find smells at position
      const sounds = soundMap.get(posId);
      if (!sounds) return addSenseLog("", "hearing");
      const sound = getLoudestSound(sounds, getState().playerId);

      processPlayerDetectedSounds(sound, gameWorld);
    }

    for (const actor of earsQuery) {
      // get smells in immediate vicinity - story in memory
      const { position } = actor;
      const neighbors = getNeighbors(
        position,
        "cardinal",
        { width: Constants.dungeonWidth, height: Constants.dungeonHeight },
        true,
      ) as string[];
      const { soundMap } = getState();
      const detectedSounds = processAiHearing(neighbors, soundMap, actor);
      actor.ears.detected = flatMap(detectedSounds);
    }
  };
};

function getLoudestSound(
  sounds: Record<EntityId, { strength: number }>,
  playerId: EntityId,
) {
  return Object.entries(sounds)
    .filter(([entityId]) => entityId !== playerId) // remove player
    .sort((a, b) => b[1].strength - a[1].strength)[0]; // sort by strength descending // get the strongest (or undefined if empty)
}

function getStrongestOdor(
  odors: Record<EntityId, { strength: number }>,
  playerId: EntityId,
) {
  return Object.entries(odors)
    .filter(([entityId]) => entityId !== playerId)
    .sort((a, b) => b[1].strength - a[1].strength)[0];
}

interface Smell {
  0: EntityId;
  1: { strength: number };
}

interface Sound {
  0: EntityId;
  1: { strength: number };
}

function processPlayerDetectedSmells(
  smell: Smell,
  gameWorld: IGameWorld,
): void {
  if (!smell) return addSenseLog("", "smell");

  const entityId = smell[0];
  const strength = smell[1].strength;
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

function processPlayerDetectedSounds(
  sound: Sound,
  gameWorld: IGameWorld,
): void {
  if (!sound) return addSenseLog("", "hearing");

  const entityId = sound[0];
  const strength = sound[1].strength;
  const entity = gameWorld.registry.get(entityId) as Entity | undefined;
  if (entity) {
    if (strength >= 8) {
      return addSenseLog(`Deafening sound of ${entity.name}`, "hearing");
    }
    if (strength >= 6) {
      return addSenseLog(`Loud sound of ${entity.name}`, "hearing");
    }
    if (strength >= 4) {
      return addSenseLog(`Clear sound of ${entity.name}`, "hearing");
    }
    if (strength >= 2) {
      return addSenseLog(`Muffled sound of ${entity.name}`, "hearing");
    }
    if (strength >= 1) {
      return addSenseLog(`Faint sound of ${entity.name}`, "hearing");
    }
    if (strength > 0) {
      return addSenseLog(`Whispered sound of ${entity.name}`, "hearing");
    }
  }
}

function processAiSmells(
  neighbors: string[],
  odorMap: Map<string, Record<EntityId, { strength: number }>>,
  actor: Entity,
): DetectedOdor[][] {
  return compact(
    neighbors.map((posId: string) => {
      const odors = odorMap.get(posId);
      if (odors) {
        const odorArray: (DetectedOdor | undefined)[] = Object.entries(
          odors,
        ).map(([eId, odorObj]) => {
          // don't detect own odor
          if (eId !== actor.id) {
            return {
              eId,
              strength: odorObj.strength,
              posId,
            };
          }
        });

        return compact(odorArray);
      }
    }),
  );
}

function processAiHearing(
  neighbors: string[],
  soundMap: Map<string, Record<EntityId, { strength: number }>>,
  actor: Entity,
): DetectedSound[][] {
  return compact(
    neighbors.map((posId: string) => {
      const sounds = soundMap.get(posId);
      if (sounds) {
        const soundArray: (DetectedSound | undefined)[] = Object.entries(
          sounds,
        ).map(([eId, soundObj]) => {
          // don't detect own odor
          if (eId !== actor.id) {
            return {
              eId,
              strength: soundObj.strength,
              posId,
            };
          }
        });

        return compact(soundArray);
      }
    }),
  );
}
