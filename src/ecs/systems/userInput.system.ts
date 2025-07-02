import { IGameWorld, ChangeZoneDirections, Entity } from "../engine";
import { GameState, State, getState, setState } from "../gameState";
import { addLog } from "../../lib/utils";

import { handleGameModeInput } from "../inputHandlers/gameMode";
import { handleInspectModeInput } from "../inputHandlers/inspectMode";
import { handleInteractActionModeInput } from "../inputHandlers/interactActionMode";
import { handleInteractModeInput } from "../inputHandlers/interactMode";
import { handleInventoryModeInput } from "../inputHandlers/inventoryMode";
import { handleLogHistoryModeInput } from "../inputHandlers/logHistoryMode";
import { handleMakerModeInput } from "../inputHandlers/makerMode";
import { handleTargetModeInput } from "../inputHandlers/targetMode";

export interface InputContext {
  key: string;
  world: IGameWorld["world"];
  registry: IGameWorld["registry"];
  player: Entity;
  state: State;
  gameState: GameState;
  setState: typeof setState;
  saveGameData: () => void;
  loadGameData: () => void;
  changeZone: (zoneId: string, direction: ChangeZoneDirections) => void;
  addLog: (string: string) => void;
}

export const createUserInputSystem = ({
  world,
  registry,
  saveGameData,
  loadGameData,
  changeZone,
}: IGameWorld) => {
  const pcQuery = world.with("pc", "position");

  return function userInputSystem() {
    const { userInput, gameState } = getState();
    const state = getState();

    if (!userInput) return;

    const { key } = userInput;
    const [player] = pcQuery;

    const ctx = {
      key,
      world,
      registry,
      player,
      state,
      gameState,
      setState,
      saveGameData,
      loadGameData,
      changeZone,
      addLog,
    };

    const inputDispatchers = {
      [GameState.GAME]: handleGameModeInput,
      [GameState.GAME_OVER]: () => true,
      [GameState.INSPECT]: handleInspectModeInput,
      [GameState.INTERACT]: handleInteractModeInput,
      [GameState.INTERACT_ACTION]: handleInteractActionModeInput,
      [GameState.INVENTORY]: handleInventoryModeInput,
      [GameState.LOG_HISTORY]: handleLogHistoryModeInput,
      [GameState.MAKER_MODE]: handleMakerModeInput,
      [GameState.TARGET]: handleTargetModeInput,
    };

    const handler = inputDispatchers[gameState];

    if (handler) {
      const handled = handler(ctx);
      if (handled) {
        setState((state: State) => {
          state.userInput = null;
        });
      }
    }
  };
};
