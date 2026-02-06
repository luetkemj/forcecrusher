import { SpellContext } from "..";
import { chars, colors } from "../../actors/graphics";
import { Spell } from "../../ecs/engine";
import { Fluids, SpellName, SpellShape, TileSet } from "../../ecs/enums";
import { createFluid } from "../utils";

export const createOil: Spell = {
  name: SpellName.CreateOil,
  displayName: "Create Oil",
  description: "Creates a pool of flammable oil",
  shape: { name: SpellShape.Point },
  appearance: {
    char: chars.spellTypeFluid,
    tint: colors.oil,
    tileSet: TileSet.Kenny,
  },
  payload: {
    fluidType: Fluids.Oil,
  },
};

export const castCreateOil = (ctx: SpellContext) => {
  createFluid(ctx, SpellName.CreateOil, { fluidType: Fluids.Oil });
};
