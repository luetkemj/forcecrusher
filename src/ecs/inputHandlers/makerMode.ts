import { InputContext } from "../systems/userInput.system";
import { GameState, State } from "../gameState";

export const handleMakerModeInput = ({ key, setState }: InputContext) => {
  if (key === "§") {
    setState((state: State) => (state.gameState = GameState.GAME));
  }
};
