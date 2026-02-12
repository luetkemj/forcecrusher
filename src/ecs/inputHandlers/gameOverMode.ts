import { InputContext } from "../systems/userInput.system";
import { GameState } from "../gameState";
import { Keys } from "./KeyMap";

export const handleGameOverModeInput = async ({
  key,
  gameState,
}: InputContext) => {
  if (gameState === GameState.GAME_OVER) {
    if (key === Keys.CANCEL) {
      window.location.reload();

      return true;
    }
  }
};
