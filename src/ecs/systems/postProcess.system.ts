import { calculateFlammability } from "../../actors";
import { IGameWorld } from "../engine";
import { PostProcess } from "../enums";

export const createPostProcessSystem = ({ world }: IGameWorld) => {
  const postProcessQuery = world.with("postProcess");

  return function postProcessSystem() {
    for (const actor of postProcessQuery) {
      const remaining: typeof actor.postProcess = [];

      for (const process of actor.postProcess) {
        // decrement only when > 0
        if (process.delay > 0) {
          process.delay -= 1;
        }

        // run when delay hits exactly 0
        if (process.delay === 0) {
          if (process.name === PostProcess.UpdateAppearance) {
            actor.appearance = {
              ...actor.appearance,
              ...process.payload,
            };
          }

          if (process.name === PostProcess.CalculateFlammability) {
            const { material, mass } = actor;
            if (material && mass) {
              const flammable = calculateFlammability(material, mass);
              world.removeComponent(actor, "flammable");
              world.addComponent(actor, "flammable", flammable);
            }
          }

          // DO NOT push into remaining — this removes it after running
          continue;
        }

        // If not run yet, keep the pending process
        if (process.delay > 0) {
          remaining.push(process);
        }
      }

      actor.postProcess = remaining;
    }
  };
};
