import { wield, wear } from "../lib/utils";
import { spawn } from "../actors";
import { type Pos } from "../lib/grid";

export const spawnRat = (position: Pos) => {
  const rat = spawn("rat", { position });

  return rat;
};

export const spawnSkeleton = (position: Pos) => {
  const skeleton = spawn("skeleton", { position });
  const weapon = spawn("shortsword");
  const armor = spawn("leatherArmor");

  wield(skeleton, weapon);
  wear(skeleton, armor);

  console.log({ skeleton, armor, weapon });

  return skeleton;
};
