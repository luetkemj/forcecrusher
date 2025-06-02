import { spawn } from "../actors";
import { type Pos } from "../lib/grid";

export const spawnRat = (position: Pos) => {
  const rat = spawn("rat", { position });

  return rat;
};

export const spawnSkeleton = (position: Pos) => {
  const weapon = spawn("shortsword");
  const skeleton = spawn("skeleton", { position });

  if (weapon.id) {
    skeleton.weaponSlot?.contents.push(weapon.id);
  }

  return skeleton;
};
