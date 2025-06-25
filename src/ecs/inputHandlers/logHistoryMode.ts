import { InputContext } from "../systems/userInput.system";
import { GameState, State } from "../gameState";

export const handleLogHistoryModeInput = ({
  key,
  state,
  setState,
}: InputContext) => {
  if (key === "H" || key === "Escape") {
    setState((state: State) => (state.gameState = GameState.GAME));
    return true;
  }

  if (key === "j" || key === "ArrowDown") {
    const { logActiveIndex, log } = state;
    const newLogActiveIndex =
      logActiveIndex === log.length - 39 ? log.length - 39 : logActiveIndex + 1;
    setState((state: State) => (state.logActiveIndex = newLogActiveIndex));
    return true;
  }

  if (key === "k" || key === "ArrowUp") {
    const { logActiveIndex } = state;
    const newLogActiveIndex = logActiveIndex === 0 ? 0 : logActiveIndex - 1;
    setState((state: State) => (state.logActiveIndex = newLogActiveIndex));
    return true;
  }
};
