import { SpellContext } from "..";
import { chars, colors } from "../../actors/graphics";
import attacks from "../../attacks";
import { Damage, Spell } from "../../ecs/engine";
import { DamageType, SpellName, SpellShape, TileSet } from "../../ecs/enums";
import { addLog } from "../../lib/utils";

export const kill: Spell = {
  name: SpellName.Kill,
  displayName: "Kill",
  description: "Instantly kills target",
  shape: { name: SpellShape.Point },
  appearance: {
    char: chars.spellTypeKill,
    tint: colors.bone,
    tileSet: TileSet.Kenny,
  },
  payload: {},
};

export const castKill = (ctx: SpellContext) => {
  const { caster, targets } = ctx;

  let success = false;

  for (const target of targets) {
    if (target.damages) {
      const damage: Damage = {
        attacker: caster.id,
        target: target.id,
        attack: attacks.rangedSpell.kill(),
        critical: false,
        damageAmounts: [
          {
            type: DamageType.Necrotic,
            amount: 1000,
            mod: 0,
          },
        ],
      };
      target.damages.push(damage);

      success = true;
    }
  }

  if (success) {
    addLog(`${caster.name} casts kill`);
  } else {
    addLog(`${caster.name} fails to cast kill`);
  }
};
