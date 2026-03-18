import { InputContext } from "../systems/userInput.system";
import { GameState, State, getState } from "../gameState";
import { Keys } from "./KeyMap";
import { bestiary } from "../../actors";

export const handleScreenBestiaryMode = ({ key, setState }: InputContext) => {
  const length = bestiary.length || 0;
  const { activeIndex } = getState().screenBestiary;

  if (key === Keys.BESTIARY || key === Keys.CANCEL) {
    setState((state: State) => (state.gameState = GameState.GAME));
    return true;
  }

  if ((Keys.SCROLL_DOWN as readonly string[]).includes(key)) {
    if (activeIndex < length - 1) {
      setState(
        (state: State) => (state.screenBestiary.activeIndex = activeIndex + 1),
      );
    } else {
      setState((state: State) => (state.screenBestiary.activeIndex = 0));
    }
    return true;
  }

  if ((Keys.SCROLL_UP as readonly string[]).includes(key)) {
    if (activeIndex > 0) {
      setState(
        (state: State) => (state.screenBestiary.activeIndex = activeIndex - 1),
      );
    } else {
      setState(
        (state: State) => (state.screenBestiary.activeIndex = length - 1),
      );
    }
    return true;
  }

  return true;
};
