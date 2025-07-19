import { IGameWorld } from "../engine";
import createFOV from "../../lib/fov";
import { toPosId } from "../../lib/grid";
import { addSenseLog } from "../../lib/utils";

export const createFovSystem = ({ world }: IGameWorld) => {
  const inFovQuery = world.with("inFov", "position");
  const opaqueQuery = world.with("opaque", "position");
  const playerQuery = world.with("pc", "position");
  const renderableQuery = world.with("appearance", "position");
  const aiQuery = world.with("ai", "inFov").without("pc");
  const pickupQuery = world.with("pickUp", "inFov", "position").without("pc");

  return function fovSystem() {
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
      100,
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

    // check for things you can see of interest
    if (aiQuery.size) {
      // rank by range and actually say what you see
      if (aiQuery.size === 1) {
        return addSenseLog("You see a threat", "sight");
      } else {
        return addSenseLog("You see threats", "sight");
      }
    }

    if (pickupQuery.size) {
      // rank by range and actually say what you see
      if (pickupQuery.size === 1) {
        return addSenseLog("You see something on the floor", "sight");
      } else {
        return addSenseLog("You see things on the floor", "sight");
      }
    }

    return addSenseLog("", "sight");
  };
};
