import { describe, test, expect, beforeEach } from "vitest";
import type { Entity, IGameWorld } from "../engine";
import { setupTestGameWorld } from "./test-utils";
import { createMovementSystem } from "./movement.system";
import { getState } from "../gameState";

describe("movement.system", () => {
  let gameWorld: IGameWorld;
  let mover: Entity;
  let blocker: Entity;
  beforeEach(() => {
    gameWorld = setupTestGameWorld();
    mover = {
      id: "mover",
      name: "Mover",
      version: 1,
      position: { x: 1, y: 1, z: 0 },
      tryMove: { x: 2, y: 1, z: 0 },
    };
    blocker = {
      id: "blocker",
      name: "Blocker",
      version: 1,
      position: { x: 2, y: 1, z: 0 },
      blocking: true,
    };
    gameWorld.world.add(mover);
    gameWorld.world.add(blocker);
  });

  test("moves entity to new position if not blocked", () => {
    // Remove blocker from the blocking position
    blocker.position = { x: 3, y: 3, z: 0 };
    createMovementSystem(gameWorld)();
    expect(mover.position).toEqual({ x: 2, y: 1, z: 0 });
    expect(mover.tryMove).toBeUndefined();
  });

  test("does not move entity if blocked", () => {
    createMovementSystem(gameWorld)();
    expect(mover.position).toEqual({ x: 1, y: 1, z: 0 });
    expect(mover.tryMove).toBeUndefined();
  });

  test("initiates attack if blocked by entity with health", () => {
    blocker.health = { max: 10, current: 10 };
    createMovementSystem(gameWorld)();
    expect(mover.tryMove).toBeUndefined();
    expect(mover.tryAttack?.targetId).toEqual(blocker.id);
  });

  test("logs message if player is blocked by non-attackable entity", () => {
    mover.pc = true;
    // Blocker has no health, so should log a message
    createMovementSystem(gameWorld)();
    const { log } = getState();
    expect(log[log.length - 1]).toBe("Mover blocked by Blocker");
  });
});
