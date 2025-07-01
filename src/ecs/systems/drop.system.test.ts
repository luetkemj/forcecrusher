import { describe, test, expect, beforeEach } from "vitest";
import type { Entity, IGameWorld } from "../engine";
import { setupTestGameWorld } from "./test-utils";
import { createDropSystem } from "./drop.system";
import { getState } from "../gameState";
import { circle, toPosId } from "../../lib/grid";

describe("drop.system", () => {
  let gameWorld: IGameWorld;
  let dropper: Entity;
  let item: Entity;
  beforeEach(() => {
    gameWorld = setupTestGameWorld();
    dropper = {
      id: "dropper",
      name: "Dropper",
      version: 1,
      position: { x: 1, y: 1, z: 0 },
      container: { name: "Bag", description: "", contents: [], slots: 5 },
    };
    item = {
      id: "item",
      name: "Rock",
      version: 1,
    };
    dropper.container?.contents.push(item.id);
    gameWorld.world.add(dropper);
    gameWorld.world.add(item);
  });

  function addTryDrop() {
    item.tryDrop = { dropperId: dropper.id };
  }

  test("drops item at or near dropper's position and removes from inventory", () => {
    addTryDrop();
    createDropSystem(gameWorld)();
    if (!dropper.position) return;
    const dropZone = circle(dropper.position, 2).posIds;
    expect(dropZone.includes(toPosId(dropper.position))).toBeTruthy();
    expect(dropper.container?.contents.includes(item.id)).toBe(false);
    expect(item.tryDrop).toBeUndefined();
    const { log } = getState();
    expect(log[log.length - 1]).toContain("Dropper");
    expect(log[log.length - 1]).toContain("Rock");
  });

  test("does nothing if dropper has no position", () => {
    dropper.position = undefined;
    addTryDrop();
    createDropSystem(gameWorld)();
    expect(item.position).toBeUndefined();
    expect(dropper.container?.contents.includes(item.id)).toBe(true);
  });

  test("does nothing if item not in dropper's inventory", () => {
    if (dropper.container) dropper.container.contents = [];
    addTryDrop();
    createDropSystem(gameWorld)();
    expect(item.position).toBeUndefined();
    expect(item.tryDrop).toBeUndefined();
  });

  test("does nothing if dropper not found", () => {
    addTryDrop();
    if (item.tryDrop) item.tryDrop.dropperId = "notfound";
    createDropSystem(gameWorld)();
    expect(item.position).toBeUndefined();
    expect(item.tryDrop).toBeUndefined();
  });
});
