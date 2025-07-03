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
  layer100Query: ReturnType<IGameWorld["world"]["with"]>;
  layer200Query: ReturnType<IGameWorld["world"]["with"]>;
  layer300Query: ReturnType<IGameWorld["world"]["with"]>;
  layer400Query: ReturnType<IGameWorld["world"]["with"]>;
}

export const createUserInputSystem = ({
  world,
  registry,
  saveGameData,
  loadGameData,
  changeZone,
}: IGameWorld) => {
  const pcQuery = world.with("pc", "position");
  const layer100Query = world.with("layer100", "position");
  const layer200Query = world.with("layer200", "position");
  const layer300Query = world.with("layer300", "position");
  const layer400Query = world.with("layer400", "position");

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
      layer100Query,
      layer200Query,
      layer300Query,
      layer400Query,
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
