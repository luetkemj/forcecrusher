import { IGameWorld } from "../engine";
import { getEAP } from "../../lib/utils";
import { Fluids } from "../enums";
import { toPosId } from "../../lib/grid";

const flammableFluidTypes = [Fluids.Lava, Fluids.Oil];

export const createWetSystem = ({ world, registry }: IGameWorld) => {
  const wetQuery = world.with("wet", "flammable").without("excludeFromSim");

  return function wetSystem() {
    for (const actor of wetQuery) {
      // check if in a fluid container area - and if so, get wet
      if (actor.position) {
        const eap = getEAP(toPosId(actor.position));
        if (!eap) continue;

        // TODO: check if in inventory and if container is wet and if waterproof - if yes, get wet

        // TODO: material should affect absorption and dryout

        for (const eid of eap) {
          const entity = registry.get(eid);
          if (!entity || !entity.fluidContainer) continue;

          // we have a fluid container - do something with it.
          for (const fluidType of Object.values(Fluids)) {
            if (!entity.fluidContainer.fluids[fluidType]) continue;

            const { volume } = entity.fluidContainer.fluids[fluidType];

            // if volume is greater than current wet level
            if (volume > actor.wet.fluids[fluidType].level) {
              // limit wetness to max of 1
              // do I need both of these checks? They both run...
              if (volume > 1) {
                actor.wet.fluids[fluidType].level = 1;

                if (flammableFluidTypes.includes(fluidType)) {
                  actor.flammable.multipliers.extinguishChance = 0;
                } else {
                  actor.flammable.multipliers.extinguishChance = 1;
                }
              }

              if (volume > 0) {
                // clamp wetness between 0 and 1
                actor.wet.fluids[fluidType].level = Math.max(
                  0,
                  Math.min(1, volume),
                );

                if (flammableFluidTypes.includes(fluidType)) {
                  actor.flammable.multipliers.extinguishChance = 0;
                } else {
                  actor.flammable.multipliers.extinguishChance = 0.75;
                }
              }
            } else {
              if (volume <= 0) {
                // dry out
                const level = Math.max(
                  0,
                  actor.wet.fluids[fluidType].level - 0.05,
                );
                actor.wet.fluids[fluidType].level = level;
              }
            }
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
    }
  };
};
