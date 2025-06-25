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

export const handleInspectModeInput = ({
  key,
  world,
  setState,
}: InputContext) => {
  // these should be provided in context?
  const pcQuery = world.with("pc", "position");

  if (key === "e" || key === "Escape") {
    setState((state: State) => {
      state.gameState = GameState.GAME;
    });
  }

  for (const entity of pcQuery) {
    if (entity?.position) {
      const { x, y, z } = entity.position;
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
        world.addComponent(entity, "interactDirection", newPos);
        setState(
          (state: State) => (state.gameState = GameState.INTERACT_ACTION),
        );

        return true;
      }
    }
  }
};
