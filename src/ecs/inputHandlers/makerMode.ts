import { InputContext } from "../systems/userInput.system";
import { GameState, State } from "../gameState";
import { Keys } from "./KeyMap";

export const handleMakerModeInput = ({ key, setState }: InputContext) => {
  if (key === Keys.TOGGLE_MAKER_MODE) {
    setState((state: State) => (state.gameState = GameState.GAME));
    
    return true;
  }
};
