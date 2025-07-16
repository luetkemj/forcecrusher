import { Entity, EntityId, IGameWorld } from "../engine";
import { Pos } from "../../lib/grid";
import { getState } from "../gameState";
import { Sense } from "../enums";

export const createMemorySystem = (gameWorld: IGameWorld) => {
  const { world, registry } = gameWorld;
  const visionQuery = world.with("vision");

  return function memorySystem() {
    const turn = getState().turnNumber;

    for (const actor of visionQuery) {
      // check things we see to decide if we should remember them
      for (const id of actor.vision.visible) {
        const target = registry.get(id);
        // if no target
        if (!target) continue;

        // if target is self
        if (target.id === actor.id) continue;

        // else
        if (target) {
          remember(actor, target, Sense.Vision);
        }
      }

      // clean up old memories
      forgetOldMemories(actor, gameWorld, turn);
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

  // remeber sentients
  if (target.ai || target.pc) {
    actor.memory.sentients[target.id] = memory;
  }

  // remember items
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

function forgetOldMemories(
  actor: Entity,
  { registry }: IGameWorld,
  turn: number,
) {
  if (!actor.memory) return;

  Object.values(actor.memory.sentients).forEach((memory) => {
    const target = registry.get(memory.id);
    if (!target) return forget(actor, memory, "sentients");

    if (target.dead) return forget(actor, memory, "sentients");

    const recall = (actor?.intelligence || 0) * 2;

    if (turn - memory.turnStamp > recall) {
      return forget(actor, memory, "sentients");
    }
  });
}
