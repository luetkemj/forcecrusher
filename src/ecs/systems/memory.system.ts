import { Entity, IGameWorld, Memory } from "../engine";
import { Pos, toPos } from "../../lib/grid";
import { getState } from "../gameState";
import { Sense } from "../enums";

export const createMemorySystem = (gameWorld: IGameWorld) => {
  const { world, registry } = gameWorld;
  const visionQuery = world.with("vision", "memory").without("dead");
  const noseQuery = world.with("nose", "memory").without("dead");
  const memoryQuery = world.with("memory").without("dead");

  return function memorySystem() {
    for (const actor of noseQuery) {
      const smells = new Map();

      actor.nose.detected.forEach((smell) => {
        // if smell already exists check if we should override with stronger smell
        if (smells.has(smell.eId)) {
          if (smells.get(smell.eId).strength < smell.strength) {
            smells.set(smell.eId, smell);
          }
          // if doesn't exist, add it
        } else {
          smells.set(smell.eId, smell);
        }
      });

      // remember strongest smell detected for each target
      smells.forEach((smell) => {
        const target = registry.get(smell.eId);
        if (!target) return;

        const memory = {
          actor,
          target,
          position: { ...toPos(smell.posId) },
          perceivedVia: Sense.Smell,
        };

        remember(memory);
      });
    }

    for (const actor of visionQuery) {
      // check things we see to decide if we should remember them
      for (const id of actor.vision.visible) {
        const target = registry.get(id);
        // if no target
        if (!target) continue;

        // if target is self
        if (target.id === actor.id) continue;

        // position is required to save memory
        if (!target.position) continue;

        // remember things that are interesting (not floors, walls, etc)
        if (isMemorable(target)) {
          remember({
            actor,
            target,
            position: { ...target.position },
            perceivedVia: Sense.Sight,
          });
        }
      }
    }

    for (const actor of memoryQuery) {
      forgetOldMemories(actor);
    }
  };
};

function remember({
  actor,
  target,
  position,
  perceivedVia,
  strength,
}: {
  actor: Entity;
  target: Entity;
  position: Pos;
  perceivedVia: Sense;
  strength?: number;
}) {
  if (!actor.memory) return;

  if (!actor.memory.memories) {
    actor.memory.memories = new Map();
  }

  const memory: Memory = {
    id: target.id,
    position,
    turn: getState().turnNumber,
    perceivedVia,
    strength,
  };

  actor.memory.memories.set(memory.id, memory);
}

function forgetOldMemories(actor: Entity) {
  if (!actor.memory) return;
  if (!actor.memory.memories) return console.log(actor);

  const { turnNumber } = getState();
  const recall = (actor?.intelligence || 0) * 2;
  for (const [_, memory] of actor.memory.memories) {
    if (turnNumber - memory.turn >= recall) {
      actor.memory.memories.delete(memory.id);
    }
  }
}

function isMemorable(target: Entity) {
  if (target.ai) return true;
  if (target.pc) return true;
  if (target.pickUp) return true;

  return false;
}
