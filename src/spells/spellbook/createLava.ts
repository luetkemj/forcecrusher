import { SpellContext } from "..";
import { Fluids, SpellName } from "../../ecs/enums";
import { createFluid } from "../utils";

export const castCreateLava = (ctx: SpellContext) => {
  createFluid(ctx, SpellName.CreateLava, { fluidType: Fluids.Lava });
};
