import { IGameWorld } from "../engine";
import createFOV from "../../lib/fov";
import { toPosId } from "../../lib/grid";

export const createFovSystem = (world: IGameWorld["world"]) => {
  const inFovQuery = world.with("inFov", "position");
  const opaqueQuery = world.with("opaque", "position");
  const playerQuery = world.with("pc", "position");
  const renderableQuery = world.with("appearance", "position");

  return function system() {
    let player;

    for (const entity of playerQuery) {
      player = entity;
    }

    if (!player) return;

    const FOV = createFOV(
      opaqueQuery,
      74, // map width
      39, // map height
      player.position,
      10,
    );

    for (const entity of inFovQuery) {
      world.removeComponent(entity, "inFov");
    }

    for (const entity of renderableQuery) {
      if (FOV.fov.has(toPosId(entity.position))) {
        world.addComponent(entity, "inFov", true);
        world.addComponent(entity, "revealed", true);
      }
    }
  };
};
