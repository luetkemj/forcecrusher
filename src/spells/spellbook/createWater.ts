import { SpellContext } from "..";
import { Fluids, SpellName } from "../../ecs/enums";
import { createFluid } from "../utils";

export const castCreateWater = (ctx: SpellContext) => {
  createFluid(ctx, SpellName.CreateWater, { fluidType: Fluids.Water });
};
