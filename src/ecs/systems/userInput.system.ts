import { world } from "../engine";
import { GameState, State, getState, setState } from "../../main";

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

const pcEntities = world.with("pc");

export const userInputSystem = () => {
  const { userInput, gameState } = getState();
  if (!userInput)
    return setState((state: State) => {
      state.userInput = null;
    });

  const { key } = userInput;

  if (gameState === GameState.GAME) {
    if (moveKeys.includes(key)) {
      for (const entity of pcEntities) {
        if (entity?.position) {
          const { x, y, z } = entity.position;

          if (key === "h" || key === "ArrowLeft") {
            const newPos = { x: x - 1, y, z };
            world.addComponent(entity, 'tryMove', newPos)
          }
          if (key === "j" || key === "ArrowDown") {
            const newPos = { x, y: y + 1, z };
            world.addComponent(entity, 'tryMove', newPos)
          }
          if (key === "k" || key === "ArrowUp") {
            const newPos = { x, y: y - 1, z };
            world.addComponent(entity, 'tryMove', newPos)
          }
          if (key === "l" || key === "ArrowRight") {
            const newPos = { x: x + 1, y, z };
            world.addComponent(entity, 'tryMove', newPos)
          }
        }
      }
    }
  }

  setState((state: State) => {
    state.userInput = null;
  });
};
