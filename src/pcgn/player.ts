import { wield, wear } from "../lib/utils";
import { spawn } from "../actors";
import { type Pos } from "../lib/grid";
import { calcAverageDamage } from "../lib/combat";

export const spawnPlayer = (position: Pos) => {
  const player = spawn("player", { position });
  const weapon = spawn("shortsword");
  const armor = spawn("leatherArmor");

  wield(player, weapon);
  wear(player, armor);

  calcAverageDamage(player, weapon);
  calcAverageDamage(player, armor);

  spawn("bottleEmpty", {
    position,
    tryPickUp: { pickerId: player.id },
  });

  return player;
};
