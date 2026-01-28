import { SpellContext } from ".";
import { Fluids, SpellName } from "../ecs/enums";
import { addLog } from "../lib/utils";

export const createFluid = (
  { caster, targets }: SpellContext,
  name: SpellName,
  payload: { fluidType: Fluids },
) => {
  let success = false;

  for (const target of targets) {
    if (target.name === "fluidContainer") {
      if (target.fluidContainer?.fluids[payload.fluidType]) {
        target.fluidContainer.fluids[payload.fluidType].volume =
          target.fluidContainer?.maxVolume;
        success = true;
      }
    }
  }

  if (success) {
    addLog(`${caster.name} casts ${name}`);
  } else {
    addLog(`${caster.name} fails to cast ${name}`);
  }
};

export const setFire = (
  { caster, targets, world }: SpellContext,
  name: SpellName,
) => {
  let success = false;

  for (const target of targets) {
    if (target.flammable && !target.onFire) {
      world.addComponent(target, "onFire", { intensity: 1, age: 0 });
      success = true;
    }
  }

  if (success) {
    addLog(`${caster.name} casts ${name}`);
  } else {
    addLog(`${caster.name} fails to cast ${name}`);
  }
};
