import { SpellContext } from "..";
import { colors } from "../../actors/graphics";
import { Spell } from "../../ecs/engine";
import { SpellName, SpellShape } from "../../ecs/enums";
import { setFire } from "../utils";

export const ignite: Spell = {
  name: SpellName.Ignite,
  displayName: "Ignite",
  description: "Set target on fire",
  shape: { name: SpellShape.Point },
  appearance: {
    char: "spellTypeFire",
    tint: colors.fire,
    tileSet: "kenny",
  },
  payload: {},
};

export const castIgnite = (ctx: SpellContext) => {
  setFire(ctx, SpellName.Ignite);
};
