import { SpellContext } from "..";
import { colors } from "../../actors/graphics";
import { Spell } from "../../ecs/engine";
import { Fluids, SpellName, SpellShape } from "../../ecs/enums";
import { createFluid } from "../utils";

export const createWater: Spell = {
  name: SpellName.CreateWater,
  displayName: "Create Water",
  description: "Creates a pool of liquid water",
  shape: SpellShape.Circle,
  appearance: {
    char: "spellTypeFluid",
    tint: colors.water,
    tileSet: "kenny",
  },
  payload: {
    fluidType: Fluids.Oil,
    shapeArgs: { radius: 1 },
  },
};

export const castCreateWater = (ctx: SpellContext) => {
  createFluid(ctx, SpellName.CreateWater, { fluidType: Fluids.Water });
};
