import { InputContext } from "../systems/userInput.system";
import { GameState, State } from "../gameState";
import { outOfBounds } from "../../lib/utils";
import { isMoveKey, getDirectionFromKey, Keys } from "./KeyMap";

export const handleInspectModeInput = ({
  key,
  state,
  player,
  setState,
}: InputContext) => {
  if (key === Keys.INSPECT || key === Keys.CANCEL) {
    setState((state: State) => (state.gameState = GameState.GAME));
  }

  if (isMoveKey(key)) {
    const dir = getDirectionFromKey(key);
    if (dir && player?.position) {
      const oldPos = state.cursor[1];
      const newPos = {
        x: oldPos.x + dir.dx,
        y: oldPos.y + dir.dy,
      };
      if (!outOfBounds(newPos)) {
        setState((state: State) => {
          state.cursor = [oldPos, newPos];
        });
      }
    }
    return true;
  }
};
