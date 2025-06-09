import { vitest, describe, test, expect } from "vitest";

import { World } from "miniplex";
import { createActiveEffectsSystem } from "./activeEffects.system";
import type { IGameWorld, Entity } from "../engine";

test("removes dead entities", () => {
  const world = new World<Entity>();
  const registry = new Map<string, Entity>();

  const deadEntity: Entity = {
    id: "1",
    name: "Orc",
    version: 1,
    health: { max: 10, current: 0 },
  };
  const aliveEntity: Entity = {
    id: "2",
    name: "Elf",
    version: 1,
    health: { max: 10, current: 5 },
  };

  world.add(deadEntity);
  world.add(aliveEntity);
  registry.set(deadEntity.id, deadEntity);
  registry.set(aliveEntity.id, aliveEntity);

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

  const system = createActiveEffectsSystem(world);
  system();

  expect(gameWorld.world.entities.length).toBe(1);
  expect(gameWorld.world.entities[0].id).toBe("2");
  expect(gameWorld.registry.has("1")).toBe(false);
});
