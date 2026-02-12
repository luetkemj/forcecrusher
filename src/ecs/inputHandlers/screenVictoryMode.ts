import { InputContext } from "../systems/userInput.system";
import { GameState } from "../gameState";
import { Keys } from "./KeyMap";

export const handleScreenVictoryMode = ({ key, gameState }: InputContext) => {
  if (gameState === GameState.SCREEN_VICTORY) {
    if (key === Keys.CANCEL) {
      window.location.reload();

      return true;
    }
  }
};
