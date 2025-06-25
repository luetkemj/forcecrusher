import { InputContext } from "../systems/userInput.system";
import { GameState, State, Turn } from "../gameState";
import { outOfBounds } from "../../lib/utils";
import { isUndefined } from "lodash";

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

export const handleTargetModeInput = ({
  key,
  world,
  registry,
  state,
  player,
  setState,
}: InputContext) => {
  if (key === "t" || key === "Escape") {
    setState((state: State) => (state.gameState = GameState.INVENTORY));
    return true;
  }

  if (key === "Enter") {
    // get selected item in inventory and add a tryThrow component
    // with a throwerId and targetPosition
    const entityId = player.container?.contents[state.inventoryActiveIndex];
    if (entityId) {
      const entity = registry.get(entityId);

      if (entity) {
        const playerId = player.id;
        if (!isUndefined(playerId)) {
          world.addComponent(entity, "tryThrow", {
            throwerId: playerId,
          });
        }
      }
    }

    setState((state: State) => {
      state.turn = Turn.WORLD;
      state.gameState = GameState.GAME;
    });
    return true;
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
