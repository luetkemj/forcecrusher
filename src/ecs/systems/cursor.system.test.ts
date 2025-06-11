import { describe, test, expect, beforeEach } from "vitest";
import type { Entity, IGameWorld } from "../engine";
import { setupTestGameWorld } from "./test-utils";
import { toPosId } from "../../lib/grid";
import { getState, setState } from "../gameState";
import { createCursorSystem } from "./cursor.system";

describe("cursor.system", () => {
  let gameWorld: IGameWorld;
  let entity: Entity;
  beforeEach(() => {
    gameWorld = setupTestGameWorld();
    entity = {
      id: "1",
      name: "Orc",
      version: 1,
      position: { x: 2, y: 2, z: 0 },
      layer100: true,
      inFov: true,
      revealed: true,
    };
    gameWorld.world.add(entity);
    // Set the cursor to the entity's position
    setState((state: any) => {
      state.cursor = [entity.position, entity.position];
    });
  });

  test("shows message for entity under cursor in FOV", () => {
    createCursorSystem(gameWorld.world)();
    const cursorPosId = toPosId(getState().cursor[1]);
    const found = gameWorld.world.entities.find(
      (e) => e.position && toPosId(e.position) === cursorPosId && e.layer100,
    );
    expect(found).toBeDefined();
    expect(found?.name).toBe("Orc");
    expect(getState().senses.see).toBe("You see the Orc");
  });

  test("shows recall message for entity not in FOV but revealed", () => {
    entity.inFov = undefined;
    entity.revealed = true;
    createCursorSystem(gameWorld.world)();
    const cursorPosId = toPosId(getState().cursor[1]);
    const found = gameWorld.world.entities.find(
      (e) => e.position && toPosId(e.position) === cursorPosId && e.layer100,
    );
    expect(found).toBeDefined();
    expect(found?.name).toBe("Orc");
    expect(getState().senses.see).toBe("You recall seeing the Orc");
  });

  test("no message if no entity under cursor", () => {
    setState((state: any) => {
      state.cursor = [
        { x: 0, y: 0, z: 0 },
        { x: 0, y: 0, z: 0 },
      ];
    });
    createCursorSystem(gameWorld.world)();
    const cursorPosId = toPosId(getState().cursor[1]);
    const found = gameWorld.world.entities.find(
      (e) => e.position && toPosId(e.position) === cursorPosId && e.layer100,
    );
    expect(found).toBeUndefined();
    expect(getState().senses.see).toBe("You see nothing.");
  });

  test("shows message for multiple entities on different layers", () => {
    const entity2: Entity = {
      id: "2",
      name: "Goblin",
      version: 1,
      position: { x: 2, y: 2, z: 0 },
      layer200: true,
      inFov: true,
      revealed: true,
    };
    gameWorld.world.add(entity2);
    createCursorSystem(gameWorld.world)();
    const cursorPosId = toPosId(getState().cursor[1]);
    const found100 = gameWorld.world.entities.find(
      (e) => e.position && toPosId(e.position) === cursorPosId && e.layer100,
    );
    const found200 = gameWorld.world.entities.find(
      (e) => e.position && toPosId(e.position) === cursorPosId && e.layer200,
    );
    expect(found100).toBeDefined();
    expect(found200).toBeDefined();
    expect(getState().senses.see).toBe("You see a Goblin on the Orc");
  });
});
