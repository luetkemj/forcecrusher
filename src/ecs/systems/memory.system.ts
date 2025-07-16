import { Entity, EntityId, IGameWorld } from "../engine";
import { Pos } from "../../lib/grid";
import { getState } from "../gameState";
import { Sense } from "../enums";

export const createMemorySystem = (gameWorld: IGameWorld) => {
  const { world, registry } = gameWorld;
  const visionQuery = world.with("vision");

  return function memorySystem() {
    for (const actor of visionQuery) {
      // check things we see to decide if we should remember them
      for (const id of actor.vision.visible) {
        const target = registry.get(id);
        if (target) {
          remember(actor, target, Sense.Vision);
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
