import createFOV from "../../lib/fov";
import { toPosId } from "../../lib/grid";
import { IGameWorld } from "../engine";

export const createPerceptionSystem = (gameWorld: IGameWorld) => {
  const { world } = gameWorld;
  const aiQuery = world.with("ai");
  const opaqueQuery = world.with("opaque", "position");
  const renderableQuery = world.with("appearance", "position");

  return function perceptionSystem() {
    for (const actor of aiQuery) {
      if (actor.vision && actor.position) {
        actor.vision.visible = [];

        const FOV = createFOV(
          opaqueQuery,
          74, // map width
          39, // map height
          actor.position,
          actor.vision.range,
        );

        for (const target of renderableQuery) {
          if (FOV.fov.has(toPosId(target.position))) {
            actor.vision?.visible.push(target.id);
          }
        }
      }
    }
  };
};
