import { IGameWorld } from "../engine";
import { getNeighbors, toPos, toPosId } from "../../lib/grid";
import type { Pos } from "../../lib/grid";
import { viewConfigs } from "../../views/views";
import { getEAP } from "../../lib/utils";
import { DamageType } from "../enums";
import createFOV from "../../lib/fov";
import { colors } from "../../actors/graphics";

const mapBoundary = {
  width: viewConfigs.map.width,
  height: viewConfigs.map.height,
};

export const createFireSystem = ({ world, registry }: IGameWorld) => {
  const onFireQuery = world.with("onFire", "flammable", "position");
  const opaqueQuery = world.with("opaque", "position");

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

      if (actor.flammable.explosive) {
        // if actor is explosive, get neighbors withing a range
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
          let canIgnite = true;

          // if fluid is in same tile
          for (const eid of eap) {
            const entity = registry.get(eid);

            if (entity?.fluidContainer) {
              const { lava, oil, blood, water } = entity.fluidContainer.fluids;

              if (lava.volume > 0 || oil.volume > 0) continue;

              if (blood.volume > 0 || water.volume > 0) {
                canIgnite = false;
              }
            }
          }

          if (!canIgnite) continue;

          for (const eid of eap) {
            const entity = registry.get(eid);
            if (entity && entity.flammable && !entity.onFire) {
              if (Math.random() < entity.flammable.ignitionChance) {
                world.addComponent(entity, "onFire", { intensity: 1, age: 0 });
              }
            }
          }
        }
      }

      // update fire age, intensity and fuel remaining
      if (actor.flammable.fuel.current > 0) {
        actor.flammable.fuel.current -= actor.onFire.intensity;

        if (actor.fluidContainer) {
          actor.fluidContainer.fluids.oil.volume -= actor.onFire.intensity;
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
        const damage = {
          attacker: null,
          instigator: actor.id,
          responder: null,
          target: actor.id,
          reason: `burned ${actor.name}`,
          critical: false,
          damageAmounts: [
            {
              type: DamageType.Fire,
              amount: actor.health.max / 5,
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

        if (actor.mutable) {
          world.addComponent(actor, "mutateTo", { name: "burnt" });
        } else if (actor.appearance) {
          actor.appearance.tint = colors.ash;
        }
      }
    }
  };
};
