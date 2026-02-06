import { describe, test, expect, beforeEach } from "vitest";
import type { Entity, IGameWorld } from "../engine";
import { setupTestGameWorld } from "./test-utils";
import { createFovSystem } from "./fov.system";
import { TileSet } from "../enums";

describe("fov.system", () => {
  let gameWorld: IGameWorld;
  let player: Entity;
  let entity: Entity;
  beforeEach(() => {
    gameWorld = setupTestGameWorld();
    player = {
      id: "player",
      name: "Player",
      version: 1,
      pc: true,
      appearance: { char: "@", tint: 0xffffff, tileSet: TileSet.Ascii },
      position: { x: 1, y: 1 },
    };
    entity = {
      id: "e1",
      name: "Wall",
      version: 1,
      appearance: { char: "#", tint: 0xffffff, tileSet: TileSet.Ascii },
      position: { x: 2, y: 1 },
    };
    gameWorld.world.add(player);
    gameWorld.world.add(entity);
  });

  test("reveals entity in FOV", () => {
    createFovSystem(gameWorld)();
    const found = gameWorld.world.entities.find((e) => e.id === entity.id);
    expect(found?.revealed).toBe(true);
  });

  test("does not reveal entity out of FOV range", () => {
    entity.position = { x: 120, y: 120 };
    createFovSystem(gameWorld)();
    const found = gameWorld.world.entities.find((e) => e.id === entity.id);
    // Should remain revealed: undefined
    expect(found?.revealed).toBeUndefined();
  });

  test("handles multiple entities in FOV", () => {
    const entity2: Entity = {
      id: "e2",
      name: "Goblin",
      version: 1,
      appearance: { char: "g", tint: 0xffffff, tileSet: TileSet.Ascii },
      position: { x: 1, y: 2 },
    };
    gameWorld.world.add(entity2);
    createFovSystem(gameWorld)();
    const found1 = gameWorld.world.entities.find((e) => e.id === entity.id);
    const found2 = gameWorld.world.entities.find((e) => e.id === entity2.id);
    expect(found1?.revealed).toBe(true);
    expect(found2?.revealed).toBe(true);
  });
});
