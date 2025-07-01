import { vitest, describe, test, expect, beforeEach } from "vitest";
import type { Entity, IGameWorld } from "../engine";
import { setupTestGameWorld } from "./test-utils";
import { createAiSystem } from "./ai.system";
import { type State, setState } from "../gameState";

// At the top of ai.system.test.ts
vitest.mock("../../lib/canvas", () => ({
  View: vitest.fn().mockImplementation(() => ({
    addLayer: vitest.fn(),
  })),
}));

describe("ai.system", () => {
  let gameWorld: IGameWorld;
  let player: Entity;
  let ai: Entity;
  beforeEach(() => {
    gameWorld = setupTestGameWorld();
    player = {
      id: "player",
      name: "Player",
      version: 1,
      pc: true,
      position: { x: 1, y: 1, z: 0 },
    };
    ai = {
      id: "ai",
      name: "AI",
      version: 1,
      ai: true,
      position: { x: 3, y: 1, z: 0 },
    };
    gameWorld.world.add(player);
    gameWorld.world.add(ai);

    setState((state: State) => {
      // @ts-expect-error: library types are incorrect
      state.views.map = {
        width: 10,
        height: 10,
      };
    });
  });

  test("AI moves toward player", () => {
    createAiSystem(gameWorld)();
    const movedAI = gameWorld.world.entities.find((e) => e.id === "ai");
    expect(movedAI?.tryMove).toBeDefined();
    // Should move left toward player
    expect(movedAI?.tryMove).toMatchObject({ x: 2, y: 1, z: 0 });
  });

  test("AI does not move if already at player position", () => {
    ai.position = { x: 1, y: 1, z: 0 };
    createAiSystem(gameWorld)();
    const movedAI = gameWorld.world.entities.find((e) => e.id === "ai");
    expect(movedAI?.tryMove).toBeUndefined();
  });

  test("AI pathfinds around blocking entities", () => {
    // Place a blocking entity between AI and player
    const blocker: Entity = {
      id: "blocker",
      name: "Blocker",
      version: 1,
      blocking: true,
      position: { x: 2, y: 1, z: 0 },
    };
    gameWorld.world.add(blocker);
    createAiSystem(gameWorld)();
    const movedAI = gameWorld.world.entities.find((e) => e.id === "ai");
    // Should move around the blocker, so y should change
    expect(movedAI?.tryMove).toBeDefined();
    expect([
      { x: 3, y: 0, z: 0 },
      { x: 3, y: 2, z: 0 },
      { x: 2, y: 0, z: 0 },
      { x: 2, y: 2, z: 0 },
    ]).toContainEqual(movedAI?.tryMove);
  });
});
