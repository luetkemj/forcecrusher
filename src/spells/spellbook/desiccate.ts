import { SpellContext } from "..";
import { chars, colors } from "../../actors/graphics";
import { Spell } from "../../ecs/engine";
import { Fluids, SpellName, SpellShape } from "../../ecs/enums";

export const desiccate: Spell = {
  name: SpellName.Desiccate,
  displayName: "Desiccate",
  description: "Evaporate all fluid within range",
  shape: { name: SpellShape.Line },
  appearance: {
    char: chars.spellTypeDesiccate,
    tint: colors.bone,
    tileSet: "kenny",
  },
  payload: {
    fluidType: Fluids.Water,
  },
};

export const castDesiccate = (ctx: SpellContext) => {
  const { targets, world } = ctx;
  for (const target of targets) {
    world.addComponent(target, "desiccate", {
      range: 1,
      rate: 100,
      absorb: false,
      allowList: [],
      denyList: [],
    });
  }
};
