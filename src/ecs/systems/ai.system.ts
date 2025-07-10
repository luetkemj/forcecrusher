import type { IGameWorld } from "../engine";
import { aStar, wanderToward } from "../../lib/pathfinding";
import { getDirection } from "../../lib/grid";
import { logFrozenEntity } from "../../lib/utils";
import { Disposition, EntityKind } from "../enums";

export const createAiSystem = ({ world, registry }: IGameWorld) => {
  const aiQuery = world.with("ai", "position", "memory");
  const positionQuery = world.with("position");

  return function aiSystem() {
    for (const actor of aiQuery) {
      // path to something of interest - not JUST the player
      const target = { position: { x: 0, y: 0 } };
      let hasTarget = false;

      // with dispositions below - do we need the player memory? Should just go for who you like/don't like.
      // player isn't special.
      // requires refactor of perception system...
      if (actor.memory.player) {
        target.position = actor.memory.player.lastKnownPosition;
        hasTarget = true;
      }

      if (actor.memory.sentients && !hasTarget) {
        // for each sentient, check dispositions.If allied, go towards and create a pack. If friendly, ignore or protect if it's fighting. If neutral, ignore. If unfriendly, attack if it's being attacked, if hostile, attack.
        // sort dispositions, find the strongest in one way or other, do that thing.
        const dispositions: Record<EntityKind, Record<EntityKind, number>> = {
          beast: {
            beast: Disposition.Neutral,
            humanoid: Disposition.Neutral,
            undead: Disposition.Neutral,
            player: Disposition.Hostile,
          },
          humanoid: {
            beast: Disposition.Neutral,
            humanoid: Disposition.Neutral,
            undead: Disposition.Hostile,
            player: Disposition.Hostile,
          },
          undead: {
            beast: Disposition.Neutral,
            humanoid: Disposition.Hostile,
            undead: Disposition.Friendly,
            player: Disposition.Hostile,
          },
          player: {
            beast: Disposition.Neutral,
            humanoid: Disposition.Neutral,
            undead: Disposition.Neutral,
            player: Disposition.Neutral,
          },
        };

        const disposition: Record<string, number> = {};

        for (const sentient of Object.values(actor.memory.sentients)) {
          const candidate = registry.get(sentient.id);
          if (!candidate) return;

          if (actor.entityKind && candidate.entityKind) {
            disposition[candidate.id] =
              dispositions[actor.entityKind][candidate.entityKind];
          }
        }

        console.log(disposition);

        const sentient = Object.values(actor.memory.sentients)[0]; // find a better way to pick than just the first
        if (sentient) {
          target.position = sentient.lastKnownPosition;
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
