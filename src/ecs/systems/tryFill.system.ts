import { transferFluid } from "../../lib/utils";
import { IGameWorld } from "../engine";

export const createTryFillSystem = ({ world, registry }: IGameWorld) => {
  const tryFillQuery = world
    .with("fluidContainer", "tryFill")
    .without("excludeFromSim");

  return function tryFillSystem() {
    for (const actor of tryFillQuery) {
      const source = registry.get(actor.tryFill.targetId);
      const container = actor;

      if (!source) continue;

      if (container.fluidContainer && source.fluidContainer) {
        // take from source what can be absorbed by container and move to container.
        for (const fluidType in source.fluidContainer.fluids) {
          const containerFluid = container.fluidContainer.fluids[fluidType];
          const sourceFluid = source.fluidContainer.fluids[fluidType];

          if (!transferFluid(containerFluid, sourceFluid)) continue;

          // if fluidType is lava and there is no more lava at source, remove fire components
          if (fluidType === "lava" && sourceFluid.volume <= 0) {
            world.removeComponent(source, "onFire");
            world.removeComponent(source, "flammable");
          }
        }
      }

      world.removeComponent(actor, "tryFill");
    }
  };
};
