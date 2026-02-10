import { InputContext } from "../systems/userInput.system";
import { GameState } from "../gameState";

export const handleGameOverModeInput = async ({ gameState }: InputContext) => {
  if (gameState === GameState.GAME_OVER) {
    return true;
  }
};
