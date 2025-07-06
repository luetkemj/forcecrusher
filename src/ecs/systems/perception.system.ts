import { IGameWorld } from "../engine";
import createFOV from "../../lib/fov";
import { toPosId } from "../../lib/grid";

export const createPerceptionSystem = ({ world }: IGameWorld) => {
  const aiQuery = world.with("ai");
  const opaqueQuery = world.with("opaque", "position");
  const renderableQuery = world.with("appearance", "position");

  return function perceptionSystem() {
    for (const entity of aiQuery) {
      if (entity.vision && entity.position) {
        entity.vision.visible = [];

        const FOV = createFOV(
          opaqueQuery,
          74, // map width
          39, // map height
          entity.position,
          entity.vision.range,
        );

        for (const renderableEntity of renderableQuery) {
          if (FOV.fov.has(toPosId(renderableEntity.position))) {
            // limit to things of interest somehow...?
            entity.vision?.visible.push(renderableEntity.id);
          }
        }
      }
    }
  };
};
