import type { IGameWorld } from "../engine";
import { aStar } from "../../lib/pathfinding";

export const createAiSystem = ({ world }: IGameWorld) => {
  const aiQuery = world.with("ai", "position", "memory");
  const positionQuery = world.with("position");

  return function aiSystem() {
    for (const actor of aiQuery) {
      // path to something of interest - not JUST the player
      const target = { position: { x: 0, y: 0 } };
      let hasTarget = false;

      if (actor.memory.player) {
        target.position = actor.memory.player.lastKnownPosition;
        hasTarget = true;
      }

      if (actor.memory.sentients && !hasTarget) {
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
      }
    }
  };
};
