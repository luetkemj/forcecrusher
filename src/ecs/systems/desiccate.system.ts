import { IGameWorld } from "../engine";
import { circle } from "../../lib/grid";
import { getEAP, logFrozenEntity } from "../../lib/utils";

export const createDesiccateSystem = ({ world, registry }: IGameWorld) => {
  const desiccateQuery = world
    .with("desiccate", "position")
    .without("excludeFromSim");

  return function desiccateSystem() {
    for (const actor of desiccateQuery) {
      // get posIds within range
      const range = circle(actor.position, actor.desiccate.range);
      // get fluid containers at each cell
      for (const posId of range.posIds) {
        // get all entities at each position
        const eAP = getEAP(posId);
        if (!eAP) continue;
        for (const eId of eAP) {
          // don't desiccate self
          if (eId === actor.id) continue;

          // if target has a fluid container
          const target = registry.get(eId);
          if (!target || !target.fluidContainer) continue;

          // desiccate!
          for (const fluid in target.fluidContainer.fluids) {
            target.fluidContainer.fluids[fluid].volume -= actor.desiccate.rate;
            if (target.fluidContainer.fluids[fluid].volume <= 0) {
              target.fluidContainer.fluids[fluid].volume = 0;
              if (fluid === "lava") {
                world.removeComponent(target, "onFire");
                world.removeComponent(target, "flammable");
                logFrozenEntity(target);
              }
            }
          }
        }
      }
    }
  };
};
