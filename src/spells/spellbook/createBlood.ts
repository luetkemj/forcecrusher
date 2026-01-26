import { SpellContext } from "..";
import { Fluids, SpellName, SpellShape } from "../../ecs/enums";
import { createFluid } from "../utils";
import { colors } from "../../actors/graphics";
import { Spell } from "../../ecs/engine";

export const createBlood: Spell = {
  name: SpellName.CreateBlood,
  displayName: "Create Blood",
  description: "Creates a pool of blood",
  shape: { name: SpellShape.Line, radius: 1 },
  appearance: {
    char: "spellTypeFluid",
    tint: colors.blood,
    tileSet: "kenny",
  },
  payload: {
    fluidType: Fluids.Blood,
  },
};

export const castCreateBlood = (ctx: SpellContext) => {
  createFluid(ctx, SpellName.CreateBlood, { fluidType: Fluids.Blood });
};
