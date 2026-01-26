import { SpellContext } from "..";
import { colors } from "../../actors/graphics";
import { Spell } from "../../ecs/engine";
import { Fluids, SpellName, SpellShape } from "../../ecs/enums";
import { createFluid } from "../utils";

export const createWater: Spell = {
  name: SpellName.CreateWater,
  displayName: "Create Water",
  description: "Creates a pool of liquid water",
  shape: { name: SpellShape.Point },
  appearance: {
    char: "spellTypeFluid",
    tint: colors.water,
    tileSet: "kenny",
  },
  payload: {
    fluidType: Fluids.Water,
  },
};

export const castCreateWater = (ctx: SpellContext) => {
  createFluid(ctx, SpellName.CreateWater, { fluidType: Fluids.Water });
};
