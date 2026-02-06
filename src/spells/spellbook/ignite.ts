import { SpellContext } from "..";
import { chars, colors } from "../../actors/graphics";
import { Spell } from "../../ecs/engine";
import { SpellName, SpellShape, TileSet } from "../../ecs/enums";
import { setFire } from "../utils";

export const ignite: Spell = {
  name: SpellName.Ignite,
  displayName: "Ignite",
  description: "Set target on fire",
  shape: { name: SpellShape.Point },
  appearance: {
    char: chars.spellTypeFire,
    tint: colors.fire,
    tileSet: TileSet.Kenny,
  },
  payload: {},
};

export const castIgnite = (ctx: SpellContext) => {
  setFire(ctx, SpellName.Ignite);
};
