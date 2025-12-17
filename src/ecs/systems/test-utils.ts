import { vitest } from "vitest";
import { World } from "miniplex";
import type { IGameWorld, Entity } from "../engine";
import { GameState, setState, State } from "../gameState";

export function setupTestGameWorld(): IGameWorld {
  // setup world AFTER 25 turn sim is complete
  setState((state: State) => (state.gameState = GameState.GAME));
  setState((state: State) => (state.simulationTurnsLeft = 0));

  const world = new World<Entity>();
  const registry = new Map<string, Entity>();

  const gameWorld: IGameWorld = {
    world,
    registry,
    zones: new Map(),
    clearEntities: vitest.fn(),
    saveZone: vitest.fn(),
    saveGameData: vitest.fn(),
    changeZone: vitest.fn(),
    loadGameData: vitest.fn(),
  };

  gameWorld.world.onEntityAdded.subscribe((entity: Entity) => {
    gameWorld.registry.set(entity.id, entity);
  });

  return gameWorld;
}
