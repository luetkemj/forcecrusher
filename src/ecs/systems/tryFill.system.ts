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

          const containerSpace =
            containerFluid.maxVolume - containerFluid.volume;

          // if no space in container or nothing to transfer from source
          if (containerSpace <= 0 || sourceFluid.volume <= 0) continue;

          // if space in container is greater than the fluid in the source, transfer all fluid from source to container
          if (containerSpace >= sourceFluid.volume) {
            containerFluid.volume += sourceFluid.volume;
            sourceFluid.volume = 0;
          }

          // if space in container for some but not all fluid from source, transfer enough to fill space in container
          if (containerSpace < sourceFluid.volume) {
            containerFluid.volume = containerFluid.maxVolume;
            sourceFluid.volume -= containerSpace;
          }
        }
      }

      world.removeComponent(actor, "tryFill");
    }
  };
};
