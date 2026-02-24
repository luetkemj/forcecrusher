import { InputContext } from "../systems/userInput.system";
import { GameState, State, getState } from "../gameState";
import { Keys } from "./KeyMap";
import { beastiary } from "../renderers/renderScreenBeastiaryDetail";

export const handleScreenBeastiaryMode = ({ key, setState }: InputContext) => {
  const length = beastiary.length || 0;
  const { activeIndex } = getState().screenBeastiary;

  if (key === Keys.BEASTIARY || key === Keys.CANCEL) {
    setState((state: State) => (state.gameState = GameState.GAME));
    return true;
  }

  if ((Keys.SCROLL_DOWN as readonly string[]).includes(key)) {
    if (activeIndex < length - 1) {
      setState(
        (state: State) => (state.screenBeastiary.activeIndex = activeIndex + 1),
      );
    } else {
      setState((state: State) => (state.screenBeastiary.activeIndex = 0));
    }
    return true;
  }

  if ((Keys.SCROLL_UP as readonly string[]).includes(key)) {
    if (activeIndex > 0) {
      setState(
        (state: State) => (state.screenBeastiary.activeIndex = activeIndex - 1),
      );
    } else {
      setState(
        (state: State) => (state.screenBeastiary.activeIndex = length - 1),
      );
    }
    return true;
  }

  return true;
};
