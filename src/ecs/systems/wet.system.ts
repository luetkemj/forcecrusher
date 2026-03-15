import { IGameWorld, Entity, Wetness } from "../engine";
import { getEAP, mixHexWeighted } from "../../lib/utils";
import { Fluids } from "../enums";
import { toPosId } from "../../lib/grid";
import { map, reduce, round } from "lodash";

const flammableFluidTypes = [Fluids.Lava, Fluids.Oil];

export const createWetSystem = ({ world, registry }: IGameWorld) => {
  const wetQuery = world.with("wet", "flammable");

  return function wetSystem() {
    for (const actor of wetQuery) {
      // check if in a fluid container area - and if so, get wet
      if (actor.position) {
        const eap = getEAP(toPosId(actor.position));
        if (!eap) continue;

        // TODO: #170 check if in inventory and if container is wet and if waterproof - if yes, get wet

        // TODO: #169 material should affect absorption and dryout

        for (const eid of eap) {
          const entity = registry.get(eid);
          if (!entity || !entity.fluidContainer) continue;

          // we have a fluid container - do something with it.
          for (const fluidType of Object.values(Fluids)) {
            if (!entity.fluidContainer.fluids[fluidType]) continue;

            const { volume } = entity.fluidContainer.fluids[fluidType];

            // if volume is greater than current wet level
            if (volume > actor.wet.fluids[fluidType].level) {
              if (volume > 0) {
                const wetLevel = Math.max(0, Math.min(1, volume));

                // clamp wetness between 0 and 1
                actor.wet.fluids[fluidType].level = wetLevel;

                if (flammableFluidTypes.includes(fluidType)) {
                  // cannot exstinguish if flammable
                  actor.flammable.multipliers.extinguishChance = 0;
                } else {
                  // 75% extinguish if wet at all
                  actor.flammable.multipliers.extinguishChance = 0.75;
                }
              }
            }
          }

          // natural dry-out over time, regardless of position or nearby fluid containers
          for (const fluidType of Object.values(Fluids)) {
            const wetState = actor.wet.fluids[fluidType];
            if (!wetState || wetState.level <= 0) continue;
            const level = Math.max(0, wetState.level - 0.05);
            wetState.level = level;
          }
        }
      }

      const wetness = actor.wet.fluids;
      const { blood, water, lava, oil } = wetness;

      if (water.level <= 0 && blood.level <= 0) {
        actor.flammable.multipliers.extinguishChance = 0;
      }

      if (lava.level > 0 || oil.level > 0) {
        actor.flammable.multipliers.extinguishChance = 0;
      }

      // adjust wetness (water cleans etc)
      if (lava.level > 0) {
        // lava dries up blood and water
        actor.wet.fluids.blood.level = 0;
        actor.wet.fluids.water.level = 0;
      }

      // water washes blood away
      if (water.level > 0 && blood.level > 0) {
        blood.level = blood.level - water.level / 2;
        if (blood.level < 0) blood.level = 0;
      }

      if (blood.level > 0) {
        if (blood.level >= 1) {
          actor.flammable.multipliers.explosive = false;
          actor.flammable.multipliers.ignitionChance = -1;
          actor.flammable.multipliers.maxIntensity = -1;
        } else {
          actor.flammable.multipliers.explosive = false;
          actor.flammable.multipliers.ignitionChance = -blood.level;
          actor.flammable.multipliers.maxIntensity = -blood.level;
        }
      }

      if (water.level > 0) {
        if (water.level >= 1) {
          actor.flammable.multipliers.explosive = false;
          actor.flammable.multipliers.ignitionChance = -1;
          actor.flammable.multipliers.maxIntensity = -1;
        } else {
          actor.flammable.multipliers.explosive = false;
          actor.flammable.multipliers.ignitionChance = -water.level * 0.1;
          actor.flammable.multipliers.maxIntensity = -water.level * 0.1;
        }
      }

      if (lava.level > 0) {
        if (lava.level >= 1) {
          actor.flammable.multipliers.explosive = false;
          actor.flammable.multipliers.ignitionChance = 1;
          actor.flammable.multipliers.maxIntensity = 2;
          actor.flammable.multipliers.extinguishChance = 0;
        } else {
          actor.flammable.multipliers.explosive = false;
          actor.flammable.multipliers.ignitionChance = 1;
          actor.flammable.multipliers.maxIntensity = 2;
          actor.flammable.multipliers.extinguishChance = 0;
        }
      }

      if (oil.level > 0) {
        if (oil.level >= 1) {
          actor.flammable.multipliers.explosive = true;
          actor.flammable.multipliers.ignitionChance = 1;
          actor.flammable.multipliers.maxIntensity = 2;
          actor.flammable.multipliers.extinguishChance = 0;
        } else {
          actor.flammable.multipliers.explosive = true;
          actor.flammable.multipliers.ignitionChance = 1;
          actor.flammable.multipliers.maxIntensity = 2;
          actor.flammable.multipliers.extinguishChance = 0;
        }
      }

      if (isDry(actor)) {
        resetMultipliers(actor);
      }
    }
  };
};

const resetMultipliers = (actor: Entity) => {
  if (actor.flammable) {
    actor.flammable.multipliers.explosive = false;
    actor.flammable.multipliers.ignitionChance = 0;
    actor.flammable.multipliers.maxIntensity = 0;
    actor.flammable.multipliers.extinguishChance = 0;
  }
};

export const isDry = (actor: Entity) => {
  if (!actor.wet) return true;
  const fluids = Object.values(Fluids);

  let dry = true;
  for (const fluid of fluids) {
    if (actor.wet.fluids[fluid].level > 0) dry = false;
  }

  return dry;
};

export const getWetColor = (actor: Entity) => {
  if (!actor.wet) return;

  if (isDry(actor)) return;

  const colors = map(actor.wet.fluids, (x) => x.tint);
  const weights = map(actor.wet.fluids, (x) => x.level);
  const wetColor = mixHexWeighted(colors, weights);

  if (wetColor) {
    return wetColor;
  }
};

export const getWetPercent = (actor: Entity) => {
  if (!actor.wet) return 0;
  const totalWetLevel = reduce(
    actor.wet.fluids,
    (acc, val) => {
      acc += val.level;
      return acc;
    },
    0,
  );

  const wetPercent = round(Math.min(totalWetLevel, 1) * 100);

  return wetPercent;
};

export const getFluidWetPercent = (fluid: Wetness) => {
  return round(Math.min(fluid.level, 1) * 100);
};
