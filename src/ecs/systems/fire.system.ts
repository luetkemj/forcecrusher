import { IGameWorld } from "../engine";
import { circle, getNeighbors, toPos, toPosId } from "../../lib/grid";
import type { Pos } from "../../lib/grid";
import { viewConfigs } from "../../views/views";
import { getEAP } from "../../lib/utils";
import { DamageType } from "../enums";
import createFOV from "../../lib/fov";
import { map } from "lodash";

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
        actor.appearance.tint = 0xfcc203;
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
      }

      // remove fire when fuel is exhausted
      if (actor.flammable.fuel.current <= 0) {
        world.removeComponent(actor, "onFire");
        world.removeComponent(actor, "flammable");

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
              amount: actor.health?.max || 0,
              mod: 0,
            },
          ],
        };

        if (!actor.damages) actor.damages = [];
        actor.damages.push(damage);

        if (actor.appearance) {
          actor.appearance.tint = 0x666666;
        }
      }
    }
  };
};
