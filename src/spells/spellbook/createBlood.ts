import { SpellContext } from "..";
import { Fluids, SpellName } from "../../ecs/enums";
import { createFluid } from "../utils";

export const castCreateBlood = (ctx: SpellContext) => {
  createFluid(ctx, SpellName.CreateBlood, { fluidType: Fluids.Blood });
};
