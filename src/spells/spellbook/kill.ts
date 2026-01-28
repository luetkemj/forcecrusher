import { SpellContext } from "..";
import { chars, colors } from "../../actors/graphics";
import { Spell } from "../../ecs/engine";
import { SpellName, SpellShape } from "../../ecs/enums";
import { addLog } from "../../lib/utils";

export const kill: Spell = {
  name: SpellName.Kill,
  displayName: "Kill",
  description: "Instantly kills target",
  shape: { name: SpellShape.Point },
  appearance: {
    char: chars.spellTypeKill,
    tint: colors.bone,
    tileSet: "kenny",
  },
  payload: {},
};

export const castKill = (ctx: SpellContext) => {
  const { caster, targets } = ctx;

  let success = false;

  for (const target of targets) {
    if (target.health) {
      target.health.current = 0;

      success = true;
    }
  }

  if (success) {
    addLog(`${caster.name} casts kill`);
  } else {
    addLog(`${caster.name} fails to cast kill`);
  }
};
