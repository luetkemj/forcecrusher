import type { IGameWorld, Memory } from "../engine";
import { aStar, wanderToward } from "../../lib/pathfinding";
import { getDirection, randomNeighbor } from "../../lib/grid";
import { getDisposition } from "../../lib/utils";
import { sortBy } from "lodash";

export const createAiSystem = ({ world, registry }: IGameWorld) => {
  const aiQuery = world.with("ai", "position", "memory");
  const positionQuery = world.with("position");

  return function aiSystem() {
    for (const actor of aiQuery) {
      // if onfire move randomly
      if (actor.onFire) {
        const newPos = randomNeighbor(actor.position);
        world.addComponent(actor, "tryMove", newPos);
        return;
      }

      // path to something of interest - not JUST the player
      let target: Memory | undefined = undefined;
      let hasTarget = false;

      // sort memories into sentient or item
      const memories: {
        sentients: Memory[];
        items: Memory[];
        dead: Memory[];
        unknown: Memory[];
      } = {
        sentients: [],
        items: [],
        dead: [],
        unknown: [],
      };

      for (const [_, memory] of actor.memory.memories) {
        const focus = registry.get(memory.id);
        if (!focus) continue;

        // Sentient
        if (focus!.pc || focus!.ai) {
          // @ts-ignore focus is garanteed to exist. TS being dumb.
          memories.sentients.push(memory);
          continue;
        }

        // Item
        if (focus!.pickUp) {
          // @ts-ignore focus is garanteed to exist. TS being dumb.
          memories.items.push(memory);
          continue;
        }

        // Unknown
        // @ts-ignore focus is garanteed to exist. TS being dumb.
        memories.unknown.push(memory);
      }

      // eventually, change behavior based on enemy personality
      // if enemy is agressive, look to fight sentients first
      // if enemy is greedy, look to pick up items first
      // if enemy is curious, look to unknown things first
      //
      // find sentient target to fight or group to
      // find item get
      // wander

      if (memories.sentients.length && !hasTarget) {
        // for each sentient, check dispositions.If allied, go towards and create a pack. If friendly, ignore or protect if it's fighting. If neutral, ignore. If unfriendly, attack if it's being attacked, if hostile, attack.
        // sort dispositions, find the strongest in one way or other, do that thing.
        const foundDispositions: Array<{ id: string; disposition: number }> =
          [];

        memories.sentients.forEach((memory) => {
          const candidate = registry.get(memory.id);
          if (!candidate) return;

          if (actor.entityKind && candidate.entityKind) {
            foundDispositions.push({
              id: candidate.id,
              disposition: getDisposition(actor, candidate),
            });
          }
        });

        const sortedDispositions = sortBy(foundDispositions, "disposition");

        if (sortedDispositions.length) {
          const candidateId = sortedDispositions[0].id;
          const selectedTarget = memories.sentients.find(
            (memory) => memory.id === candidateId,
          );
          if (selectedTarget) {
            // target.position = selectedTarget?.position;
            target = { ...selectedTarget };
            hasTarget = true;
          }
        }
      }

      if (memories.unknown.length && !hasTarget) {
        const [memory] = memories.unknown;
        target = { ...memory };
        hasTarget = true;
      }

      // const recalledItems = actor.memory.memories.filter(
      //   (memory) => memory.kind === "sentient",
      // );
      // if (recalledItems.length && !hasTarget) {
      //   const memory = Object.values(recalledItems)[0]; // find a better way to pick than just the first
      //   if (memory) {
      //     target.position = memory.position;
      //     hasTarget = true;
      //   }
      // }

      if (hasTarget && target) {
        // need to check target - if sound, aStar to source.
        // else use wanderToward
        if (target.perceivedVia === "hearing") {
          const path = aStar(
            actor.position,
            target.position,
            positionQuery.entities,
          );

          // the start and end positions are the first and last indices of path
          // start is the current location of pathing entity
          // so we skip it.
          if (path[1]) {
            const newPos = {
              x: path[1][0],
              y: path[1][1],
            };

            world.addComponent(actor, "tryMove", newPos);
          }
        } else {
          // entities need a mood component (aggressive, fleeing, etc) to determine what they do.
          const newPos = wanderToward({
            currentPos: actor.position,
            biasDir: getDirection(target.position, actor.position),
            targetPos: target.position,
            entities: positionQuery.entities,
            wiggleChance: 2,
          });
          world.addComponent(actor, "tryMove", newPos);
        }

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
