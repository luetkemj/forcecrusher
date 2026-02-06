import { SpellContext } from "..";
import { chars, colors } from "../../actors/graphics";
import { Spell } from "../../ecs/engine";
import { SpellName, SpellShape, TileSet } from "../../ecs/enums";
import { setFire } from "../utils";

export const inferno: Spell = {
  name: SpellName.Inferno,
  displayName: "Inferno",
  description: "Set everything on fire in target circle",
  shape: { name: SpellShape.Circle, radius: 3.5 },
  appearance: {
    char: chars.spellTypeFire,
    tint: colors.fire,
    tileSet: TileSet.Kenny,
  },
  payload: {},
};

export const castInferno = (ctx: SpellContext) => {
  setFire(ctx, SpellName.Inferno);
};
