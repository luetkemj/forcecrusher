import createFOV from "../../lib/fov";
import { toPosId } from "../../lib/grid";
import { addSenseLog } from "../../lib/utils";
import { EntityId, IGameWorld } from "../engine";
import { State, getState, setState } from "../gameState";

export const createPerceptionSystem = (gameWorld: IGameWorld) => {
  const { world, registry } = gameWorld;
  const aiQuery = world.with("ai");
  const opaqueQuery = world.with("opaque", "position");
  const renderableQuery = world.with("appearance", "position");

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
      // const orderedOdors = Object.entries(odors).sort((a, b) => b[1] - a[1]); // Sort by strength descending
      const smell = getStrongestOdor(odors, getState().playerId);

      if (smell) {
        const [entityId, strength] = smell;
        const entity = registry.get(entityId);
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
    }
  };
};

function getStrongestOdor(odors: Record<EntityId, number>, playerId: EntityId) {
  return Object.entries(odors)
    .filter(([entityId]) => entityId !== playerId) // remove player
    .sort((a, b) => b[1] - a[1])[0]; // sort by strength descending // get the strongest (or undefined if empty)
}
