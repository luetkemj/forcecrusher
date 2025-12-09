import { IGameWorld } from "../engine";
import { getNeighbors, toPosId } from "../../lib/grid";
import type { Pos } from "../../lib/grid";
import { viewConfigs } from "../../views/views";
import { getEAP } from "../../lib/utils";
import { calculateFlammability } from "../../actors";
import { Material } from "../enums";

const mapBoundary = {
  width: viewConfigs.map.width,
  height: viewConfigs.map.height,
};

export const createFluidSystem = ({ world, registry }: IGameWorld) => {
  const fluidContainerQuery = world.with("fluidContainer", "position");

  return function fluidSystem() {
    // ---------------------------------------------
    // 1. Prepare delta accumulator (entityID → fluidType → deltaVolume)
    // ---------------------------------------------
    const deltas: Record<string, Record<string, number>> = {}; // entityID → fluidType → delta

    // ------------------------------------------------------
    // 2. READ PHASE — compute flows but don't apply them yet
    // ------------------------------------------------------
    for (const actor of fluidContainerQuery) {
      const a = actor.fluidContainer;

      // Check if we have fluids object and it's not empty
      if (!a.fluids || Object.keys(a.fluids).length <= 0) continue;

      const neighbors = getNeighbors(
        actor.position,
        "cardinal",
        mapBoundary,
        false,
      ) as Array<Pos>;

      for (const nPos of neighbors) {
        const nEids = getEAP(toPosId(nPos));
        if (!nEids || !nEids.size) continue;

        for (const nEid of nEids) {
          const entity = registry.get(nEid);
          // Skip if no entity, no fluid container or same entity
          if (!entity || !entity.fluidContainer || entity.id === actor.id)
            continue;

          const b = entity.fluidContainer;

          // Check if target has fluids
          if (!b.fluids || Object.keys(b.fluids).length <= 0) continue;

          // Process fluid interactions
          for (const fluidType in a.fluids) {
            const aFluid = a.fluids[fluidType];

            if (aFluid.volume < aFluid.minFlow) continue;

            let bFluid;

            // Check if target has this fluid type
            if (b.fluids[fluidType]) {
              bFluid = b.fluids[fluidType];

              // Calculate flow based on volume difference and viscosity
              const volumeDiff = aFluid.volume - bFluid.volume;
              if (Math.abs(volumeDiff) < 0.001) continue; // No significant difference

              // Attempt to equalize a fraction of the difference
              let flow = volumeDiff * (aFluid.viscosity || 1);

              // Clamp to neighbor's remaining capacity
              const space = bFluid.maxVolume - bFluid.volume;
              if (space <= 0) continue;

              flow = Math.min(flow, space);
              if (flow <= 0) continue;

              // Apply delta to source (negative)
              if (!deltas[actor.id]) deltas[actor.id] = {};
              deltas[actor.id][fluidType] =
                (deltas[actor.id][fluidType] || 0) - flow;

              // Apply delta to target (positive)
              if (!deltas[entity.id]) deltas[entity.id] = {};
              deltas[entity.id][fluidType] =
                (deltas[entity.id][fluidType] || 0) + flow;
            }
          }
        }
      }
    }

    // ---------------------------------------------
    // 3. WRITE PHASE — apply all deltas at once
    // ---------------------------------------------
    for (const eId in deltas) {
      const entity = registry.get(eId);
      if (!entity?.fluidContainer) continue;

      const c = entity.fluidContainer;
      if (!c.fluids) continue;

      for (const fluidType in deltas[eId]) {
        if (!c.fluids[fluidType]) continue;

        const delta = deltas[eId][fluidType];
        c.fluids[fluidType].volume += delta;

        // Avoid floating noise
        if (c.fluids[fluidType].volume < 0.0001) {
          c.fluids[fluidType].volume = 0;
        }

        // Clamp to container capacity
        if (c.fluids[fluidType].volume > c.fluids[fluidType].maxVolume) {
          c.fluids[fluidType].volume = c.fluids[fluidType].maxVolume;
        }

        if (fluidType === "oil") {
          entity.flammable = calculateFlammability(
            Material.Oil,
            c.fluids[fluidType].volume,
          );
        }
        if (fluidType === "lava") {
          entity.flammable = {
            ...calculateFlammability(Material.Lava, c.fluids[fluidType].volume),
          };
        }

        // special case overrides
        if (fluidType === "lava") {
          if (!deltas[entity.id]) deltas[entity.id] = {};
          // water and blood in the presence of lava - disappear - as if they have turned to steam.
          // oil remains as it is a flamable material and will burn up
          // if also water, cell should turn to lavarock
          c.fluids.water.volume = 0;
          // if also blood, blood should disappear
          c.fluids.blood.volume = 0;

          world.addComponent(entity, "onFire", { intensity: 1, age: 0 });
        }
      }
    }
  };
};
