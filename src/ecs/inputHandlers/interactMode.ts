import { InputContext } from "../systems/userInput.system";
import { GameState, State } from "../gameState";
import { isMoveKey, getDirectionFromKey, Keys } from "./KeyMap";

export const handleInteractModeInput = ({
  key,
  world,
  player,
  setState,
}: InputContext) => {
  if (key === Keys.INTERACT || key === Keys.CANCEL) {
    setState((state: State) => {
      state.gameState = GameState.GAME;
    });
    return true;
  }

  if (isMoveKey(key)) {
    const dir = getDirectionFromKey(key);
    if (dir && player?.position) {
      const oldPos = player.position;
      const newPos = {
        x: oldPos.x + dir.dx,
        y: oldPos.y + dir.dy,
      };
      world.addComponent(player, "interactDirection", newPos);
      setState((state: State) => (state.gameState = GameState.INTERACT_ACTION));
      return true;
    }
  }
};
