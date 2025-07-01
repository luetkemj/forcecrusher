import { describe, test, expect, afterEach, beforeEach } from "vitest";
import type { Entity, IGameWorld } from "../engine";
import { setupTestGameWorld } from "./test-utils";
import { createPickUpSystem } from "./pickUp.system";
import { getState, setState, State } from "../gameState";

describe("pickUp.system", () => {
  let gameWorld: IGameWorld;
  let player: Entity;
  let item: Entity;
  beforeEach(() => {
    gameWorld = setupTestGameWorld();
    player = {
      id: "player",
      name: "Player",
      version: 1,
      pc: true,
      container: { name: "Bag", description: "", contents: [], slots: 2 },
    };
    item = {
      id: "item",
      name: "Potion",
      version: 1,
      pickUp: true,
      position: { x: 1, y: 1, z: 0 },
    };
    gameWorld.world.add(player);
    gameWorld.world.add(item);
  });

  afterEach(() => {
    setState((state: State) => {
      state.log = [];
    });
  });

  function addTryPickUp(pickerId = player.id) {
    item.tryPickUp = { pickerId };
  }

  test("picks up item and removes position", () => {
    addTryPickUp();
    createPickUpSystem(gameWorld)();
    expect(player.container?.contents.includes(item.id)).toBe(true);
    expect(item.position).toBeUndefined();
    expect(item.tryPickUp).toBeUndefined();
  });

  test("cancels pickup if picker has no container", () => {
    delete player.container;
    addTryPickUp();
    createPickUpSystem(gameWorld)();
    expect(item.position).toBeDefined();
    expect(item.tryPickUp).toBeUndefined();
  });

  test("logs message if picker has no container", () => {
    delete player.container;
    addTryPickUp();
    createPickUpSystem(gameWorld)();
    const { log } = getState();
    expect(log[log.length - 1]).toBe("You have nowhere to put that.");
  });

  test("cancels pickup if no container is full", () => {
    if (player.container) player.container.contents = ["a", "b"];
    addTryPickUp();
    createPickUpSystem(gameWorld)();
    expect(item.position).toBeDefined();
    expect(item.tryPickUp).toBeUndefined();
  });

  test("logs message if container is full", () => {
    if (player.container) player.container.contents = ["a", "b"];
    addTryPickUp();
    createPickUpSystem(gameWorld)();
    const { log } = getState();
    expect(log[log.length - 1]).toBe("You have no room in your Bag.");
  });

  test("does nothing if picker not found", () => {
    addTryPickUp("notfound");
    createPickUpSystem(gameWorld)();
    expect(item.position).toBeDefined();
    expect(item.tryPickUp?.pickerId).toBe("notfound");
  });
});
