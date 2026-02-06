import { SpellContext } from "..";
import { chars, colors } from "../../actors/graphics";
import { Spell, type Entity } from "../../ecs/engine";
import { DispelName, SpellName, SpellShape } from "../../ecs/enums";
import { getState } from "../../ecs/gameState";
import { World } from "miniplex";

export const desiccate: Spell = {
  name: SpellName.Desiccate,
  displayName: "Desiccate",
  description: "Evaporate all fluid within range",
  shape: { name: SpellShape.Point },
  appearance: {
    char: chars.spellTypeDesiccate,
    tint: colors.bone,
    tileSet: "kenny",
  },
  payload: {},
};

export const castDesiccate = (ctx: SpellContext) => {
  const { targets, world } = ctx;
  for (const target of targets) {
    world.addComponent(target, "desiccate", {
      range: 2,
      rate: 100,
      absorb: false,
      allowList: [],
      denyList: [],
    });
    world.addComponent(target, "spellbound", {
      dispel: DispelName.Desiccate,
      turnNumber: getState().turnNumber + 1,
    });
  }
};

export const uncastDesiccate = (world: World<Entity>, entity: Entity) => {
  world.removeComponent(entity, "desiccate");
};
