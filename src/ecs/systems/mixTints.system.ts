import { map } from "lodash";
import { IGameWorld } from "../engine";
import { mixHexWeighted } from "../../lib/utils";

export const createMixTintsSystem = ({ world }: IGameWorld) => {
  const renderFluidColor = world
    .with("renderFluidColor", "appearance")
    .without("excludeFromSim");

  return function mixTintsSystem() {
    for (const actor of renderFluidColor) {
      if (actor.renderFluidColor && actor.fluidContainer) {
        // get composite fluid color
        const colors = map(actor.fluidContainer.fluids, (x) => x.tint);
        const weights = map(actor.fluidContainer.fluids, (x) => x.volume);
        const fluidColor = mixHexWeighted(colors, weights);
        if (fluidColor) {
          actor.appearance.tint = fluidColor;
        }
      }
    }
  };
};
