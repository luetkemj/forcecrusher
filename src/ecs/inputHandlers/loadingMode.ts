import { InputContext } from "../systems/userInput.system";
import { GameState, State } from "../gameState";
import { gameStatePipelines, runPipeline } from "../systems/systemPipeline";

export const handleGameModeInput = async ({
  gameState,
  state,
  setState,
  saveGameData,
  addLog,
}: InputContext) => {
  if (gameState === GameState.SAVING) {
    await saveGameData();
    setState(
      (state: State) => (
        (state.gameState = GameState.GAME), (state.interactKey = " ")
      ),
    );
    addLog("Game saved!");

    runPipeline(gameStatePipelines[state.gameState]!, state.gameState);

    return true;
  }
  return true;
};
