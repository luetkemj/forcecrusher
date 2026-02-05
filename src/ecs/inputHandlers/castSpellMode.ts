import { InputContext } from "../systems/userInput.system";
import { GameState, State, Turn, getState } from "../gameState";
import { addLog, outOfBounds } from "../../lib/utils";
import { isMoveKey, getDirectionFromKey, Keys } from "./KeyMap";
import { spellLibrary } from "../../spells";
import { SpellCastType } from "../enums";

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
    if (getState().spellCastType === SpellCastType.KnownSpell) {
      const { spellName } = getState();

      if (spellName) {
        const spell = spellLibrary[spellName];

        if (spell && spell.name) {
          world.addComponent(player, "tryCastSpell", {
            spellName: spell.name,
          });
        } else {
          addLog("No spell selected");
        }
      }
    } else if (getState().spellCastType === SpellCastType.Spellscroll) {
      const { spellName } = getState();

      if (spellName) {
        const spell = spellLibrary[spellName];

        if (spell && spell.name) {
          world.addComponent(player, "tryCastSpell", {
            spellName: spell.name,
          });
        } else {
          addLog("No spell selected");
        }
      }
    }

    setState((state: State) => {
      state.turn = Turn.WORLD;
      state.gameState = GameState.GAME;
    });
    return true;
  }
};
