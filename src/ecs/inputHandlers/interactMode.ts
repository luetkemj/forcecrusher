import { InputContext } from "../systems/userInput.system";
import { GameState, State } from "../gameState";

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

export const handleInteractModeInput = ({
  key,
  world,
  player,
  setState,
}: InputContext) => {
  if (key === "e" || key === "Escape") {
    setState((state: State) => {
      state.gameState = GameState.GAME;
    });
    return true;
  }

  if (player?.position) {
    const { x, y, z } = player.position;
    let newPos;
    if (key === "h" || key === "ArrowLeft") {
      newPos = { x: x - 1, y, z };
    }
    if (key === "j" || key === "ArrowDown") {
      newPos = { x, y: y + 1, z };
    }
    if (key === "k" || key === "ArrowUp") {
      newPos = { x, y: y - 1, z };
    }
    if (key === "l" || key === "ArrowRight") {
      newPos = { x: x + 1, y, z };
    }

    if (moveKeys.includes(key)) {
      world.addComponent(player, "interactDirection", newPos);
      setState((state: State) => (state.gameState = GameState.INTERACT_ACTION));
      return true;
    }
  }
};
