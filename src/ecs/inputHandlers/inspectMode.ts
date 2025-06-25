import { InputContext } from "../systems/userInput.system";
import { GameState, State } from "../gameState";
import { outOfBounds } from "../../lib/utils";

const moveKeys = [
  "ArrowLeft",
  "ArrowDown",
  "ArrowUp",
  "ArrowRight",
  "h",
  "j",
  "k",
  "l",
];

export const handleInspectModeInput = ({
  key,
  state,
  player,
  setState,
}: InputContext) => {
  if (key === "L" || key === "Escape") {
    setState((state: State) => (state.gameState = GameState.GAME));
  }

  if (moveKeys.includes(key)) {
    if (player.position) {
      const oldPos = state.cursor[1];
      const { x, y, z } = oldPos;

      if (key === "h" || key === "ArrowLeft") {
        const newPos = { x: x - 1, y, z };
        if (outOfBounds(newPos)) return;
        setState((state: State) => {
          state.cursor = [oldPos, newPos];
        });
        return true;
      }
      if (key === "j" || key === "ArrowDown") {
        const newPos = { x, y: y + 1, z };
        if (outOfBounds(newPos)) return;
        setState((state: State) => {
          state.cursor = [oldPos, newPos];
        });
        return true;
      }
      if (key === "k" || key === "ArrowUp") {
        const newPos = { x, y: y - 1, z };
        if (outOfBounds(newPos)) return;
        setState((state: State) => {
          state.cursor = [oldPos, newPos];
        });
        return true;
      }
      if (key === "l" || key === "ArrowRight") {
        const newPos = { x: x + 1, y, z };
        if (outOfBounds(newPos)) return;
        setState((state: State) => {
          state.cursor = [oldPos, newPos];
        });
        return true;
      }
    }
  }
};
