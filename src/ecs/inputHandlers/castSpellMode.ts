import { InputContext } from "../systems/userInput.system";
import { GameState, State, Turn, getState } from "../gameState";
import { addLog, outOfBounds } from "../../lib/utils";
import { isMoveKey, getDirectionFromKey, Keys } from "./KeyMap";

export const handleCastSpellModeInput = ({
  key,
  state,
  player,
  setState,
  world,
}: InputContext) => {
  if (key === Keys.CAST || key === Keys.CANCEL) {
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

  if (key === Keys.CONFIRM) {
    const index = getState().spellbookActiveIndex;
    const spellName = player?.knownSpells?.[index];
    if (spellName) {
      world.addComponent(player, "tryCastSpell", {
        spellName: spellName,
      });
    } else {
      addLog("No spell selected");
    }

    setState((state: State) => {
      state.turn = Turn.WORLD;
      state.gameState = GameState.GAME;
    });
    return true;
  }
};
