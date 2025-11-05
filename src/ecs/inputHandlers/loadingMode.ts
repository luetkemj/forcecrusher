import { InputContext } from "../systems/userInput.system";
import { GameState, State } from "../gameState";

export const handleLoadingModeInput = ({ key, setState }: InputContext) => {
  if (key === "exitLoadMode") {
    setState((state: State) => (state.gameState = GameState.GAME));
    return true;
  }
  return true;
};
