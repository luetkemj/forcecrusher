import { describe, test, expect, beforeEach } from "vitest";
import type { Entity, IGameWorld } from "../engine";
import { setupTestGameWorld } from "./test-utils";
import { createMorgueSystem } from "./morgue.system";
import { getState, GameState } from "../gameState";
import { TileSet } from "../enums";

describe("morgue.system", () => {
  let gameWorld: IGameWorld;
  let entity: Entity;
  let item: Entity;
  beforeEach(() => {
    gameWorld = setupTestGameWorld();
    entity = {
      id: "1",
      name: "Skeleton",
      version: 1,
      health: { max: 10, current: 1 },
      appearance: { char: "S", tint: 0xffffff, tileSet: TileSet.Ascii },
      container: { name: "Bag", description: "", contents: [], slots: 5 },
      ai: true,
    };
    item = {
      id: "item",
      name: "Rock",
      version: 1,
    };
    entity.container?.contents.push(item.id);
    gameWorld.world.add(entity);
    gameWorld.world.add(item);
  });

  test("marks entity as dead and changes components when health <= 0", () => {
    entity.health && (entity.health.current = 0);
    createMorgueSystem(gameWorld)();
    expect(entity.appearance?.char).toBe("corpse");
    expect(entity.dead).toBe(true);
    expect(entity.layer200).toBe(true);
    expect(entity.layer300).toBeUndefined();
    expect(entity.pickUp).toBe(true);
    const { log } = getState();
    expect(log[log.length - 1]).toContain("Skeleton");
    expect(log[log.length - 1]).toContain("has died!");
  });

  test("drops inventory on death", () => {
    entity.health && (entity.health.current = 0);
    createMorgueSystem(gameWorld)();
    expect(item.tryDrop).toBeDefined();
  });

  test("sets game over if player dies", () => {
    if (entity.health) entity.health.current = 0;
    entity.name = "player";
    entity.pc = true;
    createMorgueSystem(gameWorld)();
    expect(getState().gameState).toBe(GameState.GAME_OVER);
    const { log } = getState();
    expect(log[log.length - 1]).toContain("player");
    expect(log[log.length - 1]).toContain("has died!");
  });

  test("does nothing if entity is alive", () => {
    if (entity.health) entity.health.current = 5;
    createMorgueSystem(gameWorld)();
    expect(entity.dead).toBeUndefined();
    expect(entity.appearance?.char).toBe("S");
  });
});
