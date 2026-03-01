import { Attack } from "../ecs/engine";
import { AttackType, DamageType } from "../ecs/enums";

export const kill = (opts?: Partial<Attack>): Attack => {
  return {
    name: "Kill",
    toHit: 0,
    attackType: AttackType.RangedSpell,
    damageRoll: "1d1+1000",
    damageType: DamageType.Necrotic,
    useModifier: true,
    verb: "casts",
    verbPastTense: "cast",
    magical: true,
    ...opts,
  };
};
