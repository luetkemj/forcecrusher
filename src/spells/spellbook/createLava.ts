import { SpellContext } from "..";
import { colors } from "../../actors/graphics";
import { Spell } from "../../ecs/engine";
import { Fluids, SpellName, SpellShape } from "../../ecs/enums";
import { createFluid } from "../utils";

export const createLava: Spell = {
  name: SpellName.CreateLava,
  displayName: "Create Lava",
  description: "Creates a pool of lava",
  shape: { name: SpellShape.Point },
  appearance: {
    char: "spellTypeFluid",
    tint: colors.lava,
    tileSet: "kenny",
  },
  payload: {
    fluidType: Fluids.Lava,
  },
};

export const castCreateLava = (ctx: SpellContext) => {
  createFluid(ctx, SpellName.CreateLava, { fluidType: Fluids.Lava });
};
