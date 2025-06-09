import { vitest } from "vitest";
import { World } from "miniplex";
import type { IGameWorld, Entity } from "../engine";

export function setupTestGameWorld(): IGameWorld {
  const world = new World<Entity>();
  const registry = new Map<string, Entity>();

  const gameWorld: IGameWorld = {
    world,
    registry,
    zones: new Map(),
    clearEntities: vitest.fn(),
    saveZone: vitest.fn(),
    saveGameData: vitest.fn(),
    changeZone: vitest.fn(),
    loadGameData: vitest.fn(),
  };

  gameWorld.world.onEntityAdded.subscribe((entity: Entity) => {
    gameWorld.registry.set(entity.id, entity);
  });

  return gameWorld;
}
