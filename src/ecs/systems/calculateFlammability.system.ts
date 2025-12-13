import { IGameWorld } from "../engine";
import { calculateFlammability } from "../../actors";

export const createCalculateFlammabilitySystem = ({ world }: IGameWorld) => {
  const calculateFlammabilityQuery = world
    .with("calculateFlammability")
    .without("paused");

  return function calculateFlammabilitySystem() {
    for (const actor of calculateFlammabilityQuery) {
      const { material, mass } = actor;

      if (material && mass) {
        const flammability = calculateFlammability(material, mass);
        if (flammability) {
          if (actor.flammable) {
            actor.flammable = { ...actor.flammable, ...flammability };
          } else {
            world.addComponent(actor, "flammable", flammability);
          }
        }
      } else {
        world.removeComponent(actor, "flammable");
      }

      world.removeComponent(actor, "calculateFlammability");
    }
  };
};
