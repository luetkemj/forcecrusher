import { getTotalVolume, transferFluid } from "../../lib/utils";
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

          if (!containerFluid || !sourceFluid) continue;

          if (
            !transferFluid(
              container.fluidContainer,
              containerFluid,
              sourceFluid,
              [],
              [],
            )
          )
            continue;

          // if fluidType is lava and there is no more lava at source, remove fire components
          if (fluidType === "lava" && sourceFluid.volume <= 0) {
            world.removeComponent(source, "onFire");
            world.removeComponent(source, "flammable");
          }
        }
      }

      world.removeComponent(actor, "tryFill");

      if (actor.mutable) {
        const totalVolume = getTotalVolume(actor.fluidContainer);
        const { mutations } = actor.mutable;

        if (mutations.find((m) => m.name === "empty") && totalVolume <= 0) {
          world.addComponent(actor, "mutateTo", { name: "empty" });
        }

        if (
          mutations.find((m) => m.name === "mostlyEmpty") &&
          totalVolume > 0 &&
          totalVolume < actor.fluidContainer.maxVolume / 2
        ) {
          world.addComponent(actor, "mutateTo", { name: "mostlyEmpty" });
        }

        if (
          mutations.find((m) => m.name === "mostlyFull") &&
          totalVolume >= actor.fluidContainer.maxVolume / 2 &&
          totalVolume < actor.fluidContainer.maxVolume
        ) {
          world.addComponent(actor, "mutateTo", { name: "mostlyFull" });
        }

        if (
          mutations.find((m) => m.name === "full") &&
          totalVolume >= actor.fluidContainer.maxVolume
        ) {
          world.addComponent(actor, "mutateTo", { name: "full" });
        }
      }
    }
  };
};
