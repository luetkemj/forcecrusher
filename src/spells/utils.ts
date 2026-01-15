import { SpellContext } from ".";
import { Fluids, SpellName } from "../ecs/enums";
import { addLog } from "../lib/utils";

export const createFluid = (
  { caster, targets }: SpellContext,
  name: SpellName,
  payload: { fluidType: Fluids },
) => {
  let success = false;

  const fluidContainer = targets.find((t) => t?.name === "fluidContainer");

  if (fluidContainer) {
    if (fluidContainer.fluidContainer?.fluids[payload.fluidType]) {
      fluidContainer.fluidContainer.fluids[payload.fluidType].volume =
        fluidContainer.fluidContainer?.maxVolume;
      success = true;
      addLog(`${caster.name} casts ${name}`);
    }
  }

  if (!success) {
    addLog(`${caster.name} fails to cast ${name}`);
  }
};
