import { SpellContext } from "..";
import { chars, colors } from "../../actors/graphics";
import { Spell } from "../../ecs/engine";
import { SpellName, SpellShape, TileSet } from "../../ecs/enums";
import { addLog } from "../../lib/utils";

export const knock: Spell = {
  name: SpellName.Knock,
  displayName: "Knock",
  description: "Create noise emanating from target",
  shape: { name: SpellShape.Point },
  appearance: {
    char: chars.spellTypeKnock,
    tint: colors.bone,
    tileSet: TileSet.Kenny,
  },
  payload: {},
};

export const castKnock = (ctx: SpellContext) => {
  const { caster, targets, world } = ctx;

  let success = false;

  for (const target of targets) {
    world.addComponent(target, "sound", { strength: 100 });
    success = true;
  }

  if (success) {
    addLog(`${caster.name} casts knock`);
  } else {
    addLog(`${caster.name} fails to cast knock`);
  }
};
