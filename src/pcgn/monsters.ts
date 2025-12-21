import { sample, times } from "lodash";
import { wield, wear } from "../lib/utils";
import { calcAverageDamage } from "../lib/combat";
import { spawn } from "../actors";
import { type Pos } from "../lib/grid";
import { Fluids } from "../ecs/enums";

export const spawnRat = (position: Pos) => {
  const rat = spawn("rat", { position });
  rat.averageDamage = calcAverageDamage(rat);

  return rat;
};

export const spawnLavaGolem = (position: Pos) => {
  const golem = spawn("lavaGolem", { position });
  golem.averageDamage = calcAverageDamage(golem);

  return golem;
};

export const spawnSkeleton = (position: Pos) => {
  const skeleton = spawn("skeleton", { position });
  const randomWeapons = ["shortsword", "club", "dagger"] as const;
  const weapon = spawn(sample(randomWeapons));
  const armor = spawn("leatherArmor");
  times(1, () =>
    spawn("healthPotion", {
      position,
      tryPickUp: { pickerId: skeleton.id },
    }),
  );

  wield(skeleton, weapon);
  wear(skeleton, armor);

  return skeleton;
};

export const spawnLivingSponge = (position: Pos) => {
  const monster = spawn("livingSponge", { position });
  if (monster.fluidContainer) {
    for (const fluidType in monster.fluidContainer.fluids) {
      monster.fluidContainer.fluids[fluidType].maxVolume = 1000;
    }
  }

  const fluid = sample(Fluids);
  if (fluid) {
    monster.desiccate?.allowList.push(fluid);
  }

  return monster;
};
