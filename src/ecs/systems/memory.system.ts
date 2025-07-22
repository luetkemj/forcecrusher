import { Entity, IGameWorld, Memory } from "../engine";
import { Pos, isAtSamePosition } from "../../lib/grid";
import { getState } from "../gameState";
import { Sense } from "../enums";

export const createMemorySystem = (gameWorld: IGameWorld) => {
  const { world, registry } = gameWorld;
  const visionQuery = world.with("vision", "memory");

  return function memorySystem() {
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
          remember({ actor, target, perceivedVia: Sense.Sight });
        }
      }

      // clean up old memories
      forgetOldMemories(actor);
    }
  };
};

function getMemoryKind(target: Entity | undefined) {
  if (!target) return "unknown";
  if (target.ai || target.pc) return "sentient";
  if (target.pickUp) return "item";
  return "unknown";
}

// a lot of issues here. Not super valuable yet.
// how will you know if it's dead if you haven't seen it yet? Probably should
// have to set this instead of derive it.
function getMemoryStatus(target: Entity | undefined) {
  if (!target) return "unknown";
  if (target.dead) return "dead";
  if (target.health && !target.dead) return "alive";
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

  if (index !== -1) {
    memories[index] = memory; // update existing memory
  } else {
    createMemory(actor, memory); // add new memory
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

  if (memory.kind && memory.kind !== "unknown") {
    updateOrCreateMemory(actor, memory);
  }
}

function forgetOldMemories(actor: Entity) {
  if (!actor.memory) return;
  if (!actor.memory.memories) return console.log(actor);

  const { turnNumber } = getState();

  const memories = actor.memory.memories.filter((memory) => {
    const recall = (actor?.intelligence || 0) * 2;
    return turnNumber - memory.turn <= recall; // keep this memory
  });

  actor.memory.memories = [...memories];
}
