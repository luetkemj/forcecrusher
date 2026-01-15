import { SpellContext } from "..";
import { Fluids, SpellName } from "../../ecs/enums";
import { createFluid } from "../utils";

export const castCreateOil = (ctx: SpellContext) => {
  createFluid(ctx, SpellName.CreateOil, { fluidType: Fluids.Oil });
};
