import { Entity, IGameWorld } from "../engine";
import createFOV from "../../lib/fov";
import { toPosId } from "../../lib/grid";
import { getState } from "../gameState";
import { Sense } from "../enums";

export const createPerceptionSystem = ({ world }: IGameWorld) => {
  const aiQuery = world.with("ai");
  const opaqueQuery = world.with("opaque", "position");
  const renderableQuery = world.with("appearance", "position");

  return function perceptionSystem() {
    for (const actor of aiQuery) {
      if (actor.vision && actor.position) {
        actor.vision.visible = [];

        const FOV = createFOV(
          opaqueQuery,
          74, // map width
          39, // map height
          actor.position,
          actor.vision.range,
        );

        for (const target of renderableQuery) {
          if (FOV.fov.has(toPosId(target.position))) {
            // limit to things of interest somehow...?
            actor.vision?.visible.push(target.id);
            remember(actor, target, Sense.Vision);
          }
        }
      }
    }
  };
};

function remember(actor: Entity, target: Entity, sense: Sense) {
  if (!actor.memory) return;
  if (!target.position) return;

  const memory = {
    id: target.id,
    lastKnownPosition: { ...target.position },
    turnStamp: getState().turnNumber,
    perceivedVia: sense,
  };

  if (target.pc) {
    actor.memory.player = memory;
  }

  if (target.ai && target.id !== actor.id) {
    actor.memory.sentients[target.id] = memory;
  }

  if (target.pickUp) {
    actor.memory.items[target.id] = memory;
  }
}
