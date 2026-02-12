import { IGameWorld, ChangeZoneDirections, Entity } from "../engine";
import { GameState, State, getState, setState } from "../gameState";
import { addLog } from "../../lib/utils";

import { handleGameModeInput } from "../inputHandlers/gameMode";
import { handleGameOverModeInput } from "../inputHandlers/gameOverMode";
import { handleCastSpellModeInput } from "../inputHandlers/castSpellMode";
import { handleInspectModeInput } from "../inputHandlers/inspectMode";
import { handleInteractActionModeInput } from "../inputHandlers/interactActionMode";
import { handleInteractModeInput } from "../inputHandlers/interactMode";
import { handleInventoryModeInput } from "../inputHandlers/inventoryMode";
import { handleLogHistoryModeInput } from "../inputHandlers/logHistoryMode";
import { handleMakerModeInput } from "../inputHandlers/makerMode";
import { handleTargetModeInput } from "../inputHandlers/targetMode";
import { handleMakerModePrefabSelectInput } from "../inputHandlers/makerModePrefabSelect";
import { handleSavingModeInput } from "../inputHandlers/savingMode";
import { handleSpellbookModeInput } from "../inputHandlers/spellbookMode";
import { handleLoadingModeInput } from "../inputHandlers/loadingMode";
import { handleScreenTitleMode } from "../inputHandlers/screenTitleMode";

export interface InputContext {
  key: string;
  world: IGameWorld["world"];
  registry: IGameWorld["registry"];
  player: Entity;
  state: State;
  gameState: GameState;
  setState: typeof setState;
  saveGameData: () => Promise<void>;
  loadGameData: () => Promise<void>;
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

  return async function userInputSystem() {
    const { userInput, gameState } = getState();
    const state = getState();

    if (!userInput) return;

    const { key } = userInput;
    const [player] = pcQuery;

    const ctx: InputContext = {
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
      addLog: (msg: string) => addLog(msg),
      layer100Query,
      layer200Query,
      layer300Query,
      layer400Query,
    };

    const inputDispatchers = {
      [GameState.CAST_SPELL]: handleCastSpellModeInput,
      [GameState.GAME]: handleGameModeInput,
      [GameState.GAME_OVER]: handleGameOverModeInput,
      [GameState.SIM]: () => true,
      [GameState.INSPECT]: handleInspectModeInput,
      [GameState.INTERACT]: handleInteractModeInput,
      [GameState.INTERACT_ACTION]: handleInteractActionModeInput,
      [GameState.INVENTORY]: handleInventoryModeInput,
      [GameState.LOG_HISTORY]: handleLogHistoryModeInput,
      [GameState.MAKER_MODE]: handleMakerModeInput,
      [GameState.MAKER_MODE_PREFAB_SELECT]: handleMakerModePrefabSelectInput,
      [GameState.TARGET]: handleTargetModeInput,
      [GameState.SAVING]: handleSavingModeInput,
      [GameState.SPELLBOOK]: handleSpellbookModeInput,
      [GameState.LOADING]: handleLoadingModeInput,
      [GameState.SCREEN_TITLE]: handleScreenTitleMode,
    };

    const handler = inputDispatchers[gameState];

    if (handler) {
      const handled = await handler(ctx);
      if (handled) {
        setState((state: State) => {
          state.userInput = null;
        });
      }
    }
  };
};
