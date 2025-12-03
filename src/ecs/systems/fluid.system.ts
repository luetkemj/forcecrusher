import { IGameWorld } from "../engine";
import { getNeighbors, toPosId } from "../../lib/grid";
import type { Pos } from "../../lib/grid";
import { viewConfigs } from "../../views/views";
import { getEAP } from "../../lib/utils";

const mapBoundary = {
  width: viewConfigs.map.width,
  height: viewConfigs.map.height,
};

export const createFluidSystem = ({ world, registry }: IGameWorld) => {
  const fluidContainerQuery = world.with("fluidContainer", "position");

  return function fluidSystem() {
    // ---------------------------------------------
    // 1. Prepare delta accumulator (id → deltaVolume)
    // ---------------------------------------------
    const deltas = new Map<string, number>();

    // ------------------------------------------------------
    // 2. READ PHASE — compute flows but don't apply them yet
    // ------------------------------------------------------
    for (const actor of fluidContainerQuery) {
      const a = actor.fluidContainer;

      if (!a.fluidType || a.volume <= 0) continue;

      const neighbors = getNeighbors(
        actor.position,
        "cardinal",
        mapBoundary,
        false,
      ) as Array<Pos>;

      for (const nPos of neighbors) {
        const nEIds = getEAP(toPosId(nPos));
        if (!nEIds) continue;

        let canFlow = true;
        for (const eId of nEIds) {
          const entity = registry.get(eId);
          // if we can't see through it, we can't flow through it.
          if (entity?.opaque) canFlow = false;
        }

        if (!canFlow) continue;

        for (const eId of nEIds) {
          const entity = registry.get(eId);
          if (!entity) continue;

          const b = entity.fluidContainer;
          if (!b) continue;

          const MIN_FLOW = 0.5; // tweak to taste
          if (a.volume < MIN_FLOW) continue;

          // Must match fluid type
          // if (a.fluidType !== b.fluidType) continue;

          // Compute difference
          const diff = a.volume - b.volume;
          // console.log({ a, b, diff });
          if (diff <= 0) continue; // no flow if neighbor >=

          // Attempt to equalize a fraction of the difference
          let flow = diff * (a.fluidType.viscosity || 1);

          // Clamp to neighbor's remaining capacity
          const space = b.maxVolume - b.volume;
          if (space <= 0) continue;

          flow = Math.min(flow, space);
          if (flow <= 0) continue;

          // ---------------------------------------------
          // Accumulate deltas instead of mutating volumes
          // ---------------------------------------------
          deltas.set(actor.id, (deltas.get(actor.id) ?? 0) - flow);
          deltas.set(entity.id, (deltas.get(entity.id) ?? 0) + flow);
        }
      }
    }

    // ---------------------------------------------
    // 3. WRITE PHASE — apply all deltas at once
    // ---------------------------------------------
    for (const [eId, delta] of deltas) {
      const entity = registry.get(eId);
      if (!entity?.fluidContainer) continue;

      const c = entity.fluidContainer;
      c.volume += delta;

      // Avoid floating noise
      if (c.volume < 0.0001) entity.fluidContainer.volume = 0;

      // Clamp to container capacity
      if (c.volume > c.maxVolume) entity.fluidContainer.volume = c.maxVolume;
    }
  };
};
