import { SpellContext } from "..";
import { chars, colors } from "../../actors/graphics";
import { Spell } from "../../ecs/engine";
import { SpellName, SpellShape, TileSet } from "../../ecs/enums";
import { addLog } from "../../lib/utils";

export const massKill: Spell = {
  name: SpellName.MassKill,
  displayName: "Mass Kill",
  description: "Instantly kills all targets in range",
  shape: { name: SpellShape.Circle, radius: 3.5 },
  appearance: {
    char: chars.spellTypeKill,
    tint: colors.bone,
    tileSet: TileSet.Kenny,
  },
  payload: {},
};

export const castMassKill = (ctx: SpellContext) => {
  const { caster, targets } = ctx;

  let success = false;

  for (const target of targets) {
    if (target.health) {
      target.health.current = 0;

      success = true;
    }
  }

  if (success) {
    addLog(`${caster.name} casts Mass Kill`);
  } else {
    addLog(`${caster.name} fails to cast Mass Kill`);
  }
};
