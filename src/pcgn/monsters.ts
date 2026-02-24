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

  mob.averageDamage = calcAverageDamage(mob);

  return mob;
};

export const spawnOgre = (position: Pos) => {
  const mob = spawn("ogre", { position });
  mob.averageDamage = calcAverageDamage(mob);

  return mob;
};

export const spawnOwlbear = (position: Pos) => {
  const mob = spawn("owlbear", { position });
  mob.averageDamage = calcAverageDamage(mob);

  return mob;
};

export const spawnLavaGolem = (position: Pos) => {
  const mob = spawn("lavaGolem", { position });
  mob.averageDamage = calcAverageDamage(mob);

  return mob;
};

export const spawnRat = (position: Pos) => {
  const mob = spawn("rat", { position });
  mob.averageDamage = calcAverageDamage(mob);

  return mob;
};

export const spawnSkeleton = (position: Pos) => {
  const mob = spawn("skeleton", { position });
  const weapon = spawn("shortsword");
  const armor = spawn("leatherArmor");
  times(1, () =>
    spawn("healthPotion", {
      position,
      tryPickUp: { pickerId: mob.id },
    }),
  );

  wield(mob, weapon);
  wear(mob, armor);

  return mob;
};

export const spawnLivingSponge = (position: Pos) => {
  const mob = spawn("livingSponge", { position });
  if (mob.fluidContainer) {
    mob.fluidContainer.maxVolume = 5;
  }

  const fluid = sample(Object.values(Fluids));
  if (fluid) {
    mob.desiccate?.allowList.push(fluid);
  }

  return mob;
};
