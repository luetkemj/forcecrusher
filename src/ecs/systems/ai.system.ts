import type { IGameWorld } from "../engine";
import { wanderToward } from "../../lib/pathfinding";
import { getDirection } from "../../lib/grid";
import { getDisposition } from "../../lib/utils";
import { sortBy } from "lodash";

export const createAiSystem = ({ world, registry }: IGameWorld) => {
  const aiQuery = world.with("ai", "position", "memory");
  const positionQuery = world.with("position");

  return function aiSystem() {
    for (const actor of aiQuery) {
      // path to something of interest - not JUST the player
      const target = { position: { x: 0, y: 0 } };
      let hasTarget = false;

      if (actor.memory.sentients && !hasTarget) {
        // for each sentient, check dispositions.If allied, go towards and create a pack. If friendly, ignore or protect if it's fighting. If neutral, ignore. If unfriendly, attack if it's being attacked, if hostile, attack.
        // sort dispositions, find the strongest in one way or other, do that thing.
        const foundDispositions: Array<{ id: string; disposition: number }> =
          [];

        for (const sentient of Object.values(actor.memory.sentients)) {
          const candidate = registry.get(sentient.id);
          if (!candidate) return;

          if (actor.entityKind && candidate.entityKind) {
            foundDispositions.push({
              id: candidate.id,
              disposition: getDisposition(actor, candidate),
            });
          }
        }

        const sortedDispositions = sortBy(foundDispositions, "disposition");

        if (sortedDispositions.length) {
          const candidateId = sortedDispositions[0].id;
          const selectedTarget = actor.memory.sentients[candidateId];
          target.position = selectedTarget.lastKnownPosition;
          hasTarget = true;
        }
      }

      if (actor.memory.items && !hasTarget) {
        const item = Object.values(actor.memory.items)[0]; // find a better way to pick than just the first
        if (item) {
          target.position = item.lastKnownPosition;
          hasTarget = true;
        }
      }

      if (hasTarget) {
        // entities need a mood component (aggressive, fleeing, etc) to determine what they do.
        const newPos = wanderToward({
          currentPos: actor.position,
          biasDir: getDirection(target.position, actor.position),
          targetPos: target.position,
          entities: positionQuery.entities,
          wiggleChance: 5,
        });
        world.addComponent(actor, "tryMove", newPos);

        // if aggressive:
        // const path = aStar(
        //   actor.position,
        //   target.position,
        //   positionQuery.entities,
        // );
        //
        // // the start and end positions are the first and last indices of path
        // // start is the current location of pathing entity
        // // so we skip it.
        // if (path[1]) {
        //   const newPos = {
        //     x: path[1][0],
        //     y: path[1][1],
        //   };
        //
        //   world.addComponent(actor, "tryMove", newPos);
        // }
      }
    }
  };
};
