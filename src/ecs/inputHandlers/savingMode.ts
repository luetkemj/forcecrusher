import { InputContext } from "../systems/userInput.system";
import { GameState, State } from "../gameState";

export const handleSavingModeInput = ({ key, setState }: InputContext) => {
  if (key === "exitSaveMode") {
    setState((state: State) => (state.gameState = GameState.GAME));
    return true;
  }
  return true;
};
