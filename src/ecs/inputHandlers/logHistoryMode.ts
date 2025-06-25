import { InputContext } from "../systems/userInput.system";
import { GameState, State } from "../gameState";
import { Keys } from "./KeyMap";

export const handleLogHistoryModeInput = ({
  key,
  state,
  setState,
}: InputContext) => {
  if (key === Keys.SHOW_LOG || key === Keys.CANCEL) {
    setState((state: State) => (state.gameState = GameState.GAME));
    return true;
  }

  if ((Keys.SCROLL_DOWN as readonly string[]).includes(key)) {
    const { logActiveIndex, log } = state;
    const newLogActiveIndex =
      logActiveIndex === log.length - 39 ? log.length - 39 : logActiveIndex + 1;
    setState((state: State) => (state.logActiveIndex = newLogActiveIndex));
    return true;
  }

  if ((Keys.SCROLL_UP as readonly string[]).includes(key)) {
    const { logActiveIndex } = state;
    const newLogActiveIndex = logActiveIndex === 0 ? 0 : logActiveIndex - 1;
    setState((state: State) => (state.logActiveIndex = newLogActiveIndex));
    return true;
  }
};
