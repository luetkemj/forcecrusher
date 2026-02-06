import { SpellContext } from "..";
import { chars, colors } from "../../actors/graphics";
import { Spell } from "../../ecs/engine";
import { Fluids, SpellName, SpellShape, TileSet } from "../../ecs/enums";
import { createFluid } from "../utils";

export const createLava: Spell = {
  name: SpellName.CreateLava,
  displayName: "Create Lava",
  description: "Creates a pool of lava",
  shape: { name: SpellShape.Point },
  appearance: {
    char: chars.spellTypeFluid,
    tint: colors.lava,
    tileSet: TileSet.Kenny,
  },
  payload: {
    fluidType: Fluids.Lava,
  },
};

export const castCreateLava = (ctx: SpellContext) => {
  createFluid(ctx, SpellName.CreateLava, { fluidType: Fluids.Lava });
};
