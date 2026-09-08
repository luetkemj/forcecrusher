import { spawn } from "../actors";
import { type Pos } from "../lib/grid";
import { calcAverageDamage } from "../lib/combat";
import { times } from "lodash";

export const spawnPlayer = (position: Pos) => {
  const player = spawn("player", { position });

  calcAverageDamage(player);

  times(5, () =>
    spawn("hastePotion", {
      position,
      tryPickUp: { pickerId: player.id },
    }),
  );

  times(5, () =>
    spawn("paralyzePotion", {
      position,
      tryPickUp: { pickerId: player.id },
    }),
  );

  return player;
};
