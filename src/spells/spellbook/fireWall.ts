import { SpellContext } from "..";
import { colors } from "../../actors/graphics";
import { Spell } from "../../ecs/engine";
import { SpellName, SpellShape } from "../../ecs/enums";
import { setFire } from "../utils";

export const fireWall: Spell = {
  name: SpellName.FireWall,
  displayName: "Fire Wall",
  description: "Ignites everything in target line",
  shape: { name: SpellShape.Line },
  appearance: {
    char: "fire",
    tint: colors.fire,
    tileSet: "kenny",
  },
  payload: {},
};

export const castFireWall = (ctx: SpellContext) => {
  setFire(ctx, SpellName.FireWall);
};
