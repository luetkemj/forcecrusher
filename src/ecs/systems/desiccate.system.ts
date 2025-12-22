import { IGameWorld } from "../engine";
import { circle } from "../../lib/grid";
import { getEAP, logFrozenEntity, transferFluid } from "../../lib/utils";

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

          // if fluidContainer is corked, don't allow desiccation
          if (target.fluidContainer.corked) continue;

          // absorb!
          if (actor.desiccate.absorb && actor.fluidContainer) {
            const source = target;
            const container = actor;

            if (source.fluidContainer && container.fluidContainer) {
              for (const fluidType in source.fluidContainer.fluids) {
                const containerFluid =
                  container.fluidContainer.fluids[fluidType];
                const sourceFluid = source.fluidContainer.fluids[fluidType];
                const { allowList, denyList } = actor.desiccate;

                if (!containerFluid || !sourceFluid) continue;

                if (
                  !transferFluid(
                    containerFluid,
                    sourceFluid,
                    allowList,
                    denyList,
                  )
                ) {
                  continue;
                }

                // if fluidType is lava and there is no more lava at source, remove fire components
                if (fluidType === "lava" && sourceFluid.volume <= 0) {
                  world.removeComponent(source, "onFire");
                  world.removeComponent(source, "flammable");
                }
              }
            }
          } else {
            // desiccate!
            for (const fluid in target.fluidContainer.fluids) {
              target.fluidContainer.fluids[fluid].volume -=
                actor.desiccate.rate;
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
    }
  };
};
