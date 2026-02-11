import { InputContext } from "../systems/userInput.system";
import { GameState, State } from "../gameState";

export const handleScreenTitleMode = ({ key, setState }: InputContext) => {
  if (key) {
    setState((state: State) => (state.gameState = GameState.SIM));
    return true;
  }
};
