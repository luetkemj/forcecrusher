import { IGameWorld, Entity } from "../engine";
import { getNeighbors, toPos, toPosId } from "../../lib/grid";
import type { Pos } from "../../lib/grid";
import { viewConfigs } from "../../views/views";
import { getEAP } from "../../lib/utils";
import { DamageType, Material } from "../enums";
import createFOV from "../../lib/fov";
import { colors } from "../../actors/graphics";

const mapBoundary = {
  width: viewConfigs.map.width,
  height: viewConfigs.map.height,
};

export const createFireSystem = ({ world, registry }: IGameWorld) => {
  const onFireQuery = world
    .with("onFire", "flammable", "position");
  const opaqueQuery = world
    .with("opaque", "position");

  const materialsDestroyedByFire = [
    Material.Wood,
    Material.Leather,
    Material.Cloth,
    Material.Paper,
    Material.Oil,
    Material.Plant,
  ];

  return function fireSystem() {
    for (const actor of onFireQuery) {
      // ensure position exists (miniplex typings don't narrow optional properties)
      if (!actor.position) continue;
      // change char to fire char
      // need to store original char somewhere
      // or we render fire above the char?
      if (actor.onFire && actor.appearance) {
        actor.appearance.tint = 0xfc6400;
      }

      let neighbors: Pos[] = [];

      let extinguish = false;

      // if entity is wet (soaked), remove onFire and bail
      if (Math.random() <= actor.flammable.multipliers.extinguishChance) {
        if (actor.pc) {
          console.log("extinguish", actor);
        }
        extinguish = true;
      }

      if (extinguish) {
        world.removeComponent(actor, "onFire");

        if (actor.mutable) {
          // TODO: 'singed' mutation that returns to base color after a time
          // burnt should be only for burned to death
          world.addComponent(actor, "mutateTo", { name: "burnt" });
        } else if (actor.appearance) {
          actor.appearance.tint = colors.ash;
        }

        continue;
      }

      if (actor.flammable.explosive || actor.flammable.multipliers?.explosive) {
        // if actor is explosive, get neighbors within a range
        // TODO: FOV creates a square - not the best shape.
        const FOV = createFOV(
          opaqueQuery,
          viewConfigs.map.width,
          viewConfigs.map.height,
          actor.position,
          3,
        );
        neighbors = Array.from(FOV.fov).map(toPos);
      } else {
        // spread fire
        // for each entity that is on fire
        // check each neighbor postition
        neighbors = getNeighbors(
          actor.position,
          "cardinal",
          mapBoundary,
          false,
        ) as Array<Pos>;
      }

      // if a flammable entity is not on fire and is in a neighbor position
      for (const pos of neighbors) {
        const eap = getEAP(toPosId(pos));
        if (eap) {
          for (const eid of eap) {
            const entity = registry.get(eid);
            if (entity && !entity.onFire) {
              const { flammable } = entity;
              if (flammable) {
                // if multiplier is -1, entity cannot light on fire.
                if (flammable.multipliers.ignitionChance === -1) continue;

                const ignitionChance =
                  flammable.ignitionChance +
                  flammable.multipliers.ignitionChance;

                if (Math.random() < ignitionChance) {
                  world.addComponent(entity, "onFire", {
                    intensity: 1,
                    age: 0,
                  });
                }
              }
            }
          }
        }
      }

      // update fuel remaining
      if (actor.flammable.fuel.current > 0) {
        actor.flammable.fuel.current -= actor.onFire.intensity;

        if (actor.fluidContainer && actor.fluidContainer.fluids.oil) {
          actor.fluidContainer.fluids.oil.volume -= actor.onFire.intensity;
          if (actor.fluidContainer.fluids.oil.volume <= 0) {
            actor.fluidContainer.fluids.oil.volume = 0;
          }
        }
      }

      // TODO: should probably tie this to a "wet" component of some sort. That will affect ability to light and length of being on fire. Not just a "fire goes out in liquid" system that we have now.
      // remove fire if submerged
      // Should def have a wet component or something.
      //
      // const eap = getEAP(toPosId(actor.position));
      // if (!eap) continue;
      //
      // for (const eid of eap) {
      //   const entity = registry.get(eid);
      //   if (entity?.fluidContainer && entity.fluidContainer.volume > 0) {
      //     world.removeComponent(actor, "onFire");
      //     world.removeComponent(actor, "flammable");
      //
      //     if (actor.appearance) {
      //       actor.appearance.tint = 0x666666;
      //     }
      //   }
      // }

      if (!actor.onFire) continue;

      if (actor.health) {
        const amount = getFireDamageAmount(actor);
        const damage = {
          attacker: null,
          instigator: actor.id,
          responder: null,
          target: actor.id,
          reason: `burned`,
          critical: false,
          damageAmounts: [
            {
              type: DamageType.Fire,
              amount: amount,
              mod: 0,
            },
          ],
        };

        if (!actor.damages) actor.damages = [];
        actor.damages.push(damage);
      }

      if (actor.onFire.source) continue;

      // remove fire when fuel is exhausted
      if (actor.flammable.fuel.current <= 0 && actor.onFire) {
        world.removeComponent(actor, "onFire");
        world.removeComponent(actor, "flammable");

        if (actor.material) {
          if (
            materialsDestroyedByFire.includes(actor.material) &&
            !actor.indestructible
          ) {
            world.addComponent(actor, "destroy", true);
          }
        }

        if (actor.mutable) {
          world.addComponent(actor, "mutateTo", { name: "burnt" });
        } else if (actor.appearance) {
          actor.appearance.tint = colors.ash;
        }
      }
    }
  };
};

const getFireDamageAmount = (entity: Entity) => {
  if (!entity.flammable || !entity.onFire || !entity.health) return 0;

  const { fuel } = entity.flammable;

  const fuelMax = fuel.max;
  const fuelBurned = fuel.max - fuel.current;
  const intensity = entity.onFire.intensity;

  if (fuelMax <= 0) return 0;

  // How engulfed the entity is (0 → 1)
  const burnFraction = fuelBurned / fuelMax;

  // Fire ramps up over time
  const ramp = burnFraction ** 1.5;

  // Global tuning knob
  const BASE_BURN_DAMAGE = 2;

  const damage = BASE_BURN_DAMAGE * intensity * (1 + ramp * 3); // late fire gets scary

  return Math.ceil(damage);
};
