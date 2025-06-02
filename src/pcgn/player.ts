import { wield } from "../lib/utils";
import { spawn } from "../actors";
import { type Pos } from "../lib/grid";

export const spawnPlayer = (position: Pos) => {
  const player = spawn("player", { position });
  const weapon = spawn("shortsword");

  wield(player, weapon);

  return player;
};
