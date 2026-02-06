import { SpellContext } from "..";
import { Fluids, SpellName, SpellShape, TileSet } from "../../ecs/enums";
import { createFluid } from "../utils";
import { chars, colors } from "../../actors/graphics";
import { Spell } from "../../ecs/engine";

export const createBlood: Spell = {
  name: SpellName.CreateBlood,
  displayName: "Create Blood",
  description: "Creates a pool of blood",
  shape: { name: SpellShape.Point },
  appearance: {
    char: chars.spellTypeFluid,
    tint: colors.blood,
    tileSet: TileSet.Kenny,
  },
  payload: {
    fluidType: Fluids.Blood,
  },
};

export const castCreateBlood = (ctx: SpellContext) => {
  createFluid(ctx, SpellName.CreateBlood, { fluidType: Fluids.Blood });
};
