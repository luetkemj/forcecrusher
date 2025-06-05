import { wield, wear } from "../lib/utils";
import { calcAverageDamage } from "../lib/combat";
import { spawn } from "../actors";
import { type Pos } from "../lib/grid";

export const spawnRat = (position: Pos) => {
  const rat = spawn("rat", { position });
  rat.averageDamage = calcAverageDamage(rat);

  return rat;
};

export const spawnSkeleton = (position: Pos) => {
  const skeleton = spawn("skeleton", { position });
  const weapon = spawn("shortsword");
  const armor = spawn("leatherArmor");

  wield(skeleton, weapon);
  wear(skeleton, armor);

  return skeleton;
};
