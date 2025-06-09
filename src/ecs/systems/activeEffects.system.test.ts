import { vitest, describe, test, expect } from "vitest";

import type { Entity } from "../engine";
import { setupTestGameWorld } from "./test-utils";
import { createActiveEffectsSystem } from "./activeEffects.system";

describe("activeEffects.system", () => {
  test("when effect adds health", () => {
    const gameWorld = setupTestGameWorld();

    const entity: Entity = {
      id: "1",
      name: "Orc",
      version: 1,
      health: { max: 10, current: 5 },
      activeEffects: [
        {
          delta: 5,
          component: "health",
        },
      ],
    };

    gameWorld.world.add(entity);

    const system = createActiveEffectsSystem(gameWorld.world);

    system();

    const affectedEntity = gameWorld.world.entities[0];

    expect(affectedEntity.health?.current).toBe(10);
  });

  test("when effect reduces health", () => {
    const gameWorld = setupTestGameWorld();

    const entity: Entity = {
      id: "1",
      name: "Orc",
      version: 1,
      health: { max: 10, current: 5 },
      activeEffects: [
        {
          delta: -3,
          component: "health",
        },
      ],
    };

    gameWorld.world.add(entity);

    const system = createActiveEffectsSystem(gameWorld.world);

    system();

    const affectedEntity = gameWorld.world.entities[0];

    expect(affectedEntity.health?.current).toBe(2);
  });

  test("when affect adds more than max", () => {
    const gameWorld = setupTestGameWorld();

    const entity: Entity = {
      id: "1",
      name: "Orc",
      version: 1,
      health: { max: 10, current: 5 },
      activeEffects: [
        {
          delta: 10,
          component: "health",
        },
      ],
    };

    gameWorld.world.add(entity);

    const system = createActiveEffectsSystem(gameWorld.world);

    system();

    const affectedEntity = gameWorld.world.entities[0];

    expect(affectedEntity.health?.current).toBe(10);
  });
});
