import { SpellContext } from "..";
import { chars, colors } from "../../actors/graphics";
import { Spell } from "../../ecs/engine";
import { SpellName, SpellShape } from "../../ecs/enums";
import { addLog } from "../../lib/utils";

export const knock: Spell = {
  name: SpellName.Knock,
  displayName: "Knock",
  description: "Create noise emenating from target",
  shape: { name: SpellShape.Point },
  appearance: {
    char: chars.spellTypeKnock,
    tint: colors.bone,
    tileSet: "kenny",
  },
  payload: {},
};

export const castKnock = (ctx: SpellContext) => {
  const { caster, targets, world } = ctx;

  let success = false;

  for (const target of targets) {
    world.addComponent(target, "sound", { strength: 100 });
  }

  if (success) {
    addLog(`${caster.name} casts knock`);
  } else {
    addLog(`${caster.name} fails to cast knock`);
  }
};
