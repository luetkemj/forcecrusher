import { InputContext } from "../systems/userInput.system";
import { GameState, State } from "../gameState";
import { Keys } from "./KeyMap";

export const handleMakerModePrefabSelectInput = ({
  key,
  setState,
}: InputContext) => {
  if (key === Keys.TOGGLE_MAKER_MODE) {
    setState((state: State) => (state.gameState = GameState.GAME));

    return true;
  }

  if (key === Keys.CANCEL || key === Keys.TOGGLE_MAKER_MODE_PREFAB_SELECT) {
    setState((state: State) => (state.gameState = GameState.MAKER_MODE));

    return true;
  }
};
