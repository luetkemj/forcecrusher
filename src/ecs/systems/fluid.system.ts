import { IGameWorld } from "../engine";
import { getNeighbors, toPosId } from "../../lib/grid";
import type { Pos } from "../../lib/grid";
import { viewConfigs } from "../../views/views";
import { getEAP, getTotalVolume } from "../../lib/utils";
import { calculateFlammability } from "../../actors";
import { Material } from "../enums";

const mapBoundary = {
  width: viewConfigs.map.width,
  height: viewConfigs.map.height,
};

const EPSILON_FLOW = 0.001;
const MAX_EQUALIZE_RATE = 0.49;

export const createFluidSystem = ({ world, registry }: IGameWorld) => {
  const fluidContainerQuery = world
    .with("fluidContainer", "position")
    .without("excludeFromSim");

  return function fluidSystem() {
    // ---------------------------------------------
    // 1. Prepare delta accumulator
    // ---------------------------------------------
    const deltas: Record<string, Record<string, number>> = {};

    // ---------------------------------------------
    // 2. READ PHASE — compute flows
    // ---------------------------------------------
    for (const actor of fluidContainerQuery) {
      const a = actor.fluidContainer;
      if (!a.fluids || a.corked || Object.keys(a.fluids).length === 0) {
        continue;
      }

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
          if (
            !entity ||
            !entity.fluidContainer ||
            entity?.fluidContainer?.corked ||
            entity.id === actor.id
          )
            continue;

          const b = entity.fluidContainer;

          for (const fluidType in a.fluids) {
            const aFluid = a.fluids[fluidType];
            const bFluid = b.fluids[fluidType];
            if (!bFluid) continue;

            // Only flow from higher → lower volume
            if (aFluid.volume <= bFluid.volume) continue;

            // Stable equalization rate (viscosity)
            const rate = Math.min(aFluid.viscosity ?? 0.25, MAX_EQUALIZE_RATE);

            let flow = (aFluid.volume - bFluid.volume) * rate;

            // Do not drain below residue
            const maxDrain = aFluid.volume - aFluid.minFlow;
            if (maxDrain <= 0) continue;

            // Clamp to available drain and target capacity
            const totalB = getTotalVolume(b);
            const space = b.maxVolume - totalB;
            if (space <= 0) continue;

            flow = Math.min(flow, maxDrain, space);
            if (flow <= EPSILON_FLOW) continue;

            if (actor.fluidContainer.outflow && entity.fluidContainer.inflow) {
              // Apply deltas
              // outflow
              deltas[actor.id] ??= {};
              deltas[actor.id][fluidType] =
                (deltas[actor.id][fluidType] || 0) - flow;

              // inflow
              deltas[entity.id] ??= {};
              deltas[entity.id][fluidType] =
                (deltas[entity.id][fluidType] || 0) + flow;
            }
          }
        }
      }
    }

    // ---------------------------------------------
    // 3. WRITE PHASE — apply deltas
    // ---------------------------------------------
    for (const eId in deltas) {
      const entity = registry.get(eId);
      if (!entity?.fluidContainer) continue;

      const c = entity.fluidContainer;
      if (!c.fluids) continue;

      for (const fluidType in deltas[eId]) {
        const f = c.fluids[fluidType];
        if (!f) continue;

        f.volume += deltas[eId][fluidType];

        // Numerical stability
        if (f.volume < EPSILON_FLOW) f.volume = 0;
        if (f.volume < 0) f.volume = 0;
      }
    }

    // ---------------------------------------------
    // 4. Recalculate flammability
    // ---------------------------------------------
    const fluidLayers = ["lava", "water", "blood", "oil"];

    for (const entity of fluidContainerQuery) {
      const c = entity.fluidContainer;

      for (const fluidType of fluidLayers) {
        const f = c.fluids[fluidType];
        if (!f || f.volume <= 0) continue;

        switch (fluidType) {
          case "water":
            entity.flammable = calculateFlammability(Material.Water, f.volume);
            break;

          case "blood":
            entity.flammable = calculateFlammability(Material.Blood, f.volume);
            break;

          case "oil":
            entity.flammable = calculateFlammability(Material.Oil, f.volume);
            break;

          case "lava":
            entity.flammable = calculateFlammability(Material.Lava, f.volume);
            world.addComponent(entity, "onFire", {
              intensity: 1,
              age: 0,
              source: true,
            });
            // Lava interactions (lava deletes other fluid
            if (c.fluids.water) c.fluids.water.volume = 0;
            if (c.fluids.blood) c.fluids.blood.volume = 0;

            break;
        }
      }
    }
  };
};
