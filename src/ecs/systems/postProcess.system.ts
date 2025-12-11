import { calculateFlammability } from "../../actors";
import { IGameWorld } from "../engine";
import { PostProcess } from "../enums";

export const createPostProcessSystem = ({ world }: IGameWorld) => {
  const postProcessQuery = world.with("postProcess");

  return function postProcessSystem() {
    for (const actor of postProcessQuery) {
      for (const process of actor.postProcess) {
        console.log("hello");
        console.log(
          "COMPARE",
          process.process.name,
          PostProcess.UpdateAppearance,
        );

        if (process.delay > -1) {
          process.delay -= 1;
        } else {
          console.log("hello");
          console.log(process);

          if (process.process.name === PostProcess.UpdateAppearance) {
            console.log("updateAppearance");
            actor.appearance = {
              ...actor.appearance,
              ...process.process.payload,
            };
          }

          if (process.process.name === PostProcess.CalculateFlammability) {
            console.log("calculateFlammability");
            const { material, mass } = actor;
            console.log(material, mass);
            if (material && mass) {
              const flammable = calculateFlammability(material, mass);
              console.log(flammable, material, mass);
              world.removeComponent(actor, "flammable");
              world.addComponent(actor, "flammable", flammable);
            }
          }
        }
      }

      // remove complete processes
      actor.postProcess = actor.postProcess.filter((x) => x.delay > 0);
    }
  };
};
