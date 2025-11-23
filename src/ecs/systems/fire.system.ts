import { IGameWorld } from "../engine";
import { getNeighbors } from "../../lib/grid";
import { viewConfigs } from "../../views/views";
import { getEAP } from "../../lib/utils";

const mapBoundary = {
  width: viewConfigs.map.width,
  height: viewConfigs.map.height,
};

export const createFireSystem = ({ world, registry }: IGameWorld) => {
  const onFireQuery = world.with("onFire", "flammable", "position");

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

      // spread fire
      // for each entity that is on fire
      // check each neighbor postition
      const neighbors = getNeighbors(
        actor.position,
        "cardinal",
        mapBoundary,
        true,
      ) as Array<string>;
      // if a flammable entity is not on fire and is in a neighbor position

      for (const pos of neighbors) {
        const eap = getEAP(pos);
        if (eap) {
          for (const eid of eap) {
            const entity = registry.get(eid);
            if (entity && entity.flammable) {
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

        if (actor.appearance) {
          actor.appearance.tint = 0x111111;
        }
      }
    }
  };
};
