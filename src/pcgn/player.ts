import { spawn } from "../actors";
import { type Pos } from "../lib/grid";
import { calcAverageDamage } from "../lib/combat";

export const spawnPlayer = (position: Pos) => {
  const player = spawn("player", { position });

  calcAverageDamage(player);
  calcAverageDamage(player);

  return player;
};
