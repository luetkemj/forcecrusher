import { describe, test, expect, beforeEach } from "vitest";
import type { Entity, IGameWorld } from "../engine";

import { setupTestGameWorld } from "./test-utils";
import { createActiveEffectsSystem } from "./activeEffects.system";

describe("activeEffects.system", () => {
  let gameWorld: IGameWorld;
  let entity: Entity;
  beforeEach(() => {
    gameWorld = setupTestGameWorld();
    entity = {
      id: "1",
      name: "Orc",
      version: 1,
      health: { max: 10, current: 5 },
      activeEffects: [],
    };
    gameWorld.world.add(entity);
  });

  test("when effect adds health", () => {
    entity.activeEffects?.push({
      delta: 5,
      component: "health",
    });

    createActiveEffectsSystem(gameWorld)();

    const affectedEntity = gameWorld.world.entities[0];

    expect(affectedEntity.health?.current).toBe(10);
  });

  test("when effect reduces health", () => {
    entity.activeEffects?.push({
      delta: -3,
      component: "health",
    });

    createActiveEffectsSystem(gameWorld)();

    const affectedEntity = gameWorld.world.entities[0];

    expect(affectedEntity.health?.current).toBe(2);
  });

  test("when effect adds more than max", () => {
    entity.activeEffects?.push({
      delta: 10,
      component: "health",
    });

    createActiveEffectsSystem(gameWorld)();

    const affectedEntity = gameWorld.world.entities[0];

    expect(affectedEntity.health?.current).toBe(10);
    expect(affectedEntity.activeEffects?.length).toBe(0);
  });

  test("when effect reduces below 0", () => {
    entity.activeEffects?.push({
      delta: -10,
      component: "health",
    });

    createActiveEffectsSystem(gameWorld)();

    const affectedEntity = gameWorld.world.entities[0];

    expect(affectedEntity.health?.current).toBe(-5);
    expect(affectedEntity.activeEffects?.length).toBe(0);
  });

  test("when there are multiple effects", () => {
    entity.activeEffects?.push({
      delta: -10,
      component: "health",
    });
    entity.activeEffects?.push({
      delta: 10,
      component: "health",
    });

    createActiveEffectsSystem(gameWorld)();

    const affectedEntity = gameWorld.world.entities[0];

    expect(affectedEntity.health?.current).toBe(5);
    expect(affectedEntity.activeEffects?.length).toBe(0);
  });
});
