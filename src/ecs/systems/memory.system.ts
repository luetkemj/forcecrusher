import { Entity, EntityId, IGameWorld, Memory } from "../engine";
import { Pos, isAtSamePosition } from "../../lib/grid";
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
          remember(actor, target, Sense.Sight);
        }
      }

      // clean up old memories
      forgetOldMemories(actor, gameWorld, turn);
    }
  };
};

function getMemoryKind(target: Entity | undefined) {
  if (!target) return "unknown";
  if (target.ai) return "sentient";
  if (target.pickUp) return "item";
  return "unknown";
}

function getMemoryStatus(target: Entity | undefined) {
  if (!target) return "unknown";
  if (target.ai && target.dead) return "dead";
  if (target.ai && !target.dead) return "alive";
  if (target.pickUp) return "unknown";
  return "unknown";
}

function createMemory(actor: Entity, memory: Memory) {
  if (actor.memory) {
    actor.memory.memories.push(memory);
  }
}

function updateOrCreateMemory(actor: Entity, memory: Memory) {
  // Safely exit if no actor or no memory component
  if (!actor?.memory) return createMemory(actor, memory);

  const memories = actor.memory.memories;

  // Find the index of the matching memory (either by id or position + sense)
  const index = memories.findIndex((mem) => {
    if (memory.id && memory.id === mem.id) return true;

    return (
      !memory.id &&
      mem.perceivedVia === memory.perceivedVia &&
      isAtSamePosition(mem.position, memory.position)
    );
  });

  // If we found it, update that memory
  if (index !== -1) {
    createMemory(actor, memory);
  }
}

function remember({
  actor,
  target,
  position,
  perceivedVia,
  strength,
}: {
  actor: Entity;
  target?: Entity;
  position?: Pos;
  perceivedVia: Sense;
  strength?: number;
}) {
  if (!actor.memory) return;
  if (!target && !position) return;

  const memory: Memory = {
    id: target?.id,
    kind: getMemoryKind(target),
    status: getMemoryStatus(target),
    position: target?.position || position || { x: 0, y: 0 },
    turn: getState().turnNumber,
    perceivedVia,
    strength,
  };

  updateOrCreateMemory(actor, memory);
}
// function remember(actor: Entity, target: Entity, sense: Sense) {
//   if (!actor.memory) return;
//   if (!target.position) return;
//
//   const memory: Memory = {
//     id: target.id,
//     lastKnownPosition: { ...target.position },
//     turnStamp: getState().turnNumber,
//     perceivedVia: sense,
//   };
//
//   // remeber sentients
//   if (target.ai || target.pc) {
//     actor.memory.sentients[target.id] = memory;
//   }
//
//   // remember items
//   if (target.pickUp) {
//     actor.memory.items[target.id] = memory;
//   }
// }

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
