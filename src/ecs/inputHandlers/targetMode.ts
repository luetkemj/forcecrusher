import { InputContext } from "../systems/userInput.system";
import { GameState, State, Turn } from "../gameState";
import { outOfBounds } from "../../lib/utils";
import { isUndefined } from "lodash";
import { Keys, getDirectionFromKey, isMoveKey } from "./KeyMap";

export const handleTargetModeInput = ({
  key,
  world,
  registry,
  state,
  player,
  setState,
}: InputContext) => {
  if (key === Keys.TARGET || key === Keys.CANCEL) {
    setState((state: State) => (state.gameState = GameState.INVENTORY));
    return true;
  }

  if (key === Keys.CONFIRM) {
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
