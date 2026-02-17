import { removePosition } from "../../lib/utils";
import { IGameWorld } from "../engine";
import { getState } from "../gameState";

export const createDestroySystem = ({ world, registry, zones }: IGameWorld) => {
  const destroyQuery = world.with("destroy").without("excludeFromSim");

  return function destroySystem() {
    for (const actor of destroyQuery) {
      world.removeComponent(actor, "destroy");

      // remove from postion (removes from eap map inside util func)
      removePosition(world, actor);

      // remove from zone
      const { zoneId } = getState();
      const zone = zones.get(zoneId);
      if (zone) zone.delete(actor.id);

      // remove from registry
      registry.delete(actor.id);

      // remove from world
      world.remove(actor);
    }
  };
};
