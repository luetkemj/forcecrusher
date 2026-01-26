import { SpellContext } from "..";
import { colors } from "../../actors/graphics";
import { Spell } from "../../ecs/engine";
import { Fluids, SpellName, SpellShape } from "../../ecs/enums";
import { createFluid } from "../utils";

export const createOil: Spell = {
  name: SpellName.CreateOil,
  displayName: "Create Oil",
  description: "Creates a pool of flammable oil",
  shape: { name: SpellShape.Point },
  appearance: {
    char: "spellTypeFluid",
    tint: colors.oil,
    tileSet: "kenny",
  },
  payload: {
    fluidType: Fluids.Oil,
  },
};

export const castCreateOil = (ctx: SpellContext) => {
  createFluid(ctx, SpellName.CreateOil, { fluidType: Fluids.Oil });
};
