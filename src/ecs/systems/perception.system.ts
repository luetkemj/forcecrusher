import { Entity, EntityId, IGameWorld } from "../engine";
import createFOV from "../../lib/fov";
import { Pos, toPosId } from "../../lib/grid";
import { getState } from "../gameState";
import { Sense } from "../enums";

export const createPerceptionSystem = (gameWorld: IGameWorld) => {
  const { world } = gameWorld;
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
            // ignore self
            if (actor.id !== target.id) {
              actor.vision?.visible.push(target.id);
              remember(actor, target, Sense.Vision);
            }
          }
        }
      }

      // clean up old memories
      forgetOldMemories(actor, gameWorld);
    }
  };
};

type Memory = {
  id: EntityId;
  lastKnownPosition: Pos;
  turnStamp: number;
  perceivedVia: Sense;
};

function remember(actor: Entity, target: Entity, sense: Sense) {
  if (!actor.memory) return;
  if (!target.position) return;

  const memory: Memory = {
    id: target.id,
    lastKnownPosition: { ...target.position },
    turnStamp: getState().turnNumber,
    perceivedVia: sense,
  };

  if (target.ai || target.pc) {
    actor.memory.sentients[target.id] = memory;
  }

  if (target.pickUp) {
    actor.memory.items[target.id] = memory;
  }
}

function forget(
  actor: Entity,
  memory: Memory,
  memoryKey: "sentients" | "items",
) {
  if (actor.memory) delete actor.memory[memoryKey][memory.id];
}

function forgetOldMemories(actor: Entity, { registry }: IGameWorld) {
  if (!actor.memory) return;

  Object.values(actor.memory.sentients).forEach((memory) => {
    const target = registry.get(memory.id);
    if (!target) return forget(actor, memory, "sentients");

    if (target.dead) return forget(actor, memory, "sentients");
  });
}
