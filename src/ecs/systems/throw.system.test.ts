import { describe, test, expect, beforeEach, afterEach } from "vitest";
import type { Entity, IGameWorld } from "../engine";
import { setupTestGameWorld } from "./test-utils";
import { createThrowSystem } from "./throw.system";
import { setState, type State } from "../gameState";
import type { Pos } from "../../lib/grid";

describe("throw.system", () => {
  let gameWorld: IGameWorld;
  let thrower: Entity;
  let item: Entity;

  beforeEach(() => {
    gameWorld = setupTestGameWorld();
    thrower = {
      id: "thrower",
      name: "Thrower",
      version: 1,
      position: { x: 1, y: 1, z: 0 },
      container: { name: "Bag", description: "", contents: [], slots: 5 },
    };
    item = {
      id: "item",
      name: "Rock",
      version: 1,
      position: { x: 1, y: 1, z: 0 },
    };
    thrower.container?.contents.push(item.id);
    gameWorld.world.add(thrower);
    gameWorld.world.add(item);
  });

  afterEach(() => {});

  function addTryThrow(throwerId = thrower.id) {
    gameWorld.world.addComponent(item, "tryThrow", { throwerId });
  }

  test("does not throw if thrower not found", () => {
    addTryThrow("notfound");
    createThrowSystem(gameWorld.world, gameWorld.registry)();
    expect(item.position).toEqual({ x: 1, y: 1, z: 0 });
    expect(item.tryThrow).toBeUndefined();
  });

  test("throws item to target position if not blocked", () => {
    const targetPos: Pos = { x: 3, y: 1, z: 0 };
    setState(
      (state: State) => (state.cursor = [thrower.position as Pos, targetPos]),
    );
    addTryThrow();
    createThrowSystem(gameWorld.world, gameWorld.registry)();
    expect(item.position).toEqual(targetPos);
    expect(item.tryThrow).toBeUndefined();
  });

  test("item lands in front of blocker if blocked", () => {
    const blocker: Entity = {
      id: "blocker",
      name: "Blocker",
      version: 1,
      blocking: true,
      position: { x: 3, y: 1, z: 0 },
    };
    gameWorld.world.add(blocker);
    const targetPos: Pos = { x: 4, y: 1, z: 0 };
    setState(
      (state: State) => (state.cursor = [thrower.position as Pos, targetPos]),
    );
    addTryThrow();
    createThrowSystem(gameWorld.world, gameWorld.registry)();
    expect(item.position).toEqual({ x: 2, y: 1, z: 0 });
    expect(item.tryThrow).toBeUndefined();
  });
});
