import { IGameWorld } from "../engine";

export const createTryFillSystem = ({ world, registry }: IGameWorld) => {
  const tryFillQuery = world
    .with("fluidContainer", "tryFill")
    .without("excludeFromSim");

  return function tryFillSystem() {
    for (const actor of tryFillQuery) {
      console.log(actor);
      const source = registry.get(actor.tryFill.targetId);
      const container = actor;

      if (!source) continue;

      if (container.fluidContainer && source.fluidContainer) {
        console.log({ container, source });
        // take from source what can be absorbed by container and move to container.
        for (const fluidType in source.fluidContainer.fluids) {
          const containerFluid = container.fluidContainer.fluids[fluidType];
          const sourceFluid = source.fluidContainer.fluids[fluidType];

          const sourceSpace = sourceFluid.maxVolume - sourceFluid.volume;
          const containerSpace =
            containerFluid.maxVolume - containerFluid.volume;

          console.log({
            fluidType,
            containerName: container.name,
            sourceName: source.name,
            containerFluidVolume: containerFluid.volume,
            sourceFluidVolume: sourceFluid.volume,
            sourceSpace,
            containerSpace,
          });

          // if no space in container or nothing to transfer from source
          if (containerSpace <= 0 || sourceFluid.volume <= 0) continue;

          // if space in container is greater than the fluid in the source, transfer all fluid from source to container
          if (containerSpace >= sourceFluid.volume) {
            containerFluid.volume += sourceFluid.volume;
            sourceFluid.volume = 0;
            // source.fluidContainer.fluids[fluidType].volume +=
            //   containerFluid.volume;
            // source.fluidContainer.fluids[fluidType].volume = 0;
          }

          // if space in container for some but not all fluid from source, transfer enough to fill space in container
          if (containerSpace < sourceFluid.volume) {
            containerFluid.volume = containerFluid.maxVolume;
            sourceFluid.volume -= containerSpace;

            // source.fluidContainer.fluids[fluidType].volume =
            //   sourceFluid.maxVolume;
            // source.fluidContainer.fluids[fluidType].volume -= sourceSpace;
          }

          console.log({ containerFluid, sourceFluid, sourceSpace });

          // containerFluid.volume = 0;
        }
      }

      world.removeComponent(actor, "tryFill");
    }
  };
};
