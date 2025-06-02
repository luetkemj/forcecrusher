import { equip } from "../lib/utils";
import { spawn } from "../actors";
import { type Pos } from "../lib/grid";

export const spawnRat = (position: Pos) => {
  const rat = spawn("rat", { position });

  return rat;
};

export const spawnSkeleton = (position: Pos) => {
  const skeleton = spawn("skeleton", { position });
  const weapon = spawn("shortsword");
  const weapon2 = spawn("shortsword");

  equip(skeleton, weapon);
  equip(skeleton, weapon2);

  return skeleton;
};
