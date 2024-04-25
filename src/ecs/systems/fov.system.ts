import { world } from "../engine";
import createFOV from "../../lib/fov";
import { toPosId } from "../../lib/grid";

const inFovEntities = world.with("inFov", "position");
const opaqueEntities = world.with("opaque", "position");
const playerEntities = world.with("pc", "position");
const renderableEntities = world.with("appearance", "position");

export const fovSystem = () => {
  let player;

  for (const entity of playerEntities) {
    player = entity;
  }

  if (!player) return;

  const FOV = createFOV(
    opaqueEntities,
    74, // map width
    39, // map height
    player.position,
    10,
  );

  for (const entity of inFovEntities) {
    world.removeComponent(entity, "inFov");
  }

  for (const entity of renderableEntities) {
    if (FOV.fov.has(toPosId(entity.position))) {
      world.addComponent(entity, "inFov", true);
      world.addComponent(entity, "revealed", true);
    }
  }
};
