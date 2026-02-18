import { random, sample, times } from "lodash";
import { wield, wear } from "../lib/utils";
import { calcAverageDamage } from "../lib/combat";
import { spawn } from "../actors";
import { type Pos } from "../lib/grid";
import { Fluids } from "../ecs/enums";

export const spawnGoblin = (position: Pos) => {
  const mob = spawn("goblin", { position });
  const weapon = spawn("dagger");
  const armor = spawn("leatherArmor");

  if (random(0, 1)) {
    wield(mob, weapon);
  }

  if (random(0, 1)) {
    wear(mob, armor);
  }

  return mob;
};

export const spawnLavaGolem = (position: Pos) => {
  const golem = spawn("lavaGolem", { position });
  golem.averageDamage = calcAverageDamage(golem);

  return golem;
};

export const spawnRat = (position: Pos) => {
  const rat = spawn("rat", { position });
  rat.averageDamage = calcAverageDamage(rat);

  return rat;
};

export const spawnSkeleton = (position: Pos) => {
  const skeleton = spawn("skeleton", { position });
  const weapon = spawn("shortsword");
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
    monster.fluidContainer.maxVolume = 5;
  }

  const fluid = sample(Object.values(Fluids));
  if (fluid) {
    monster.desiccate?.allowList.push(fluid);
  }

  return monster;
};
