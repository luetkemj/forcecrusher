import { InputContext } from "../systems/userInput.system";
import { GameState, State, getState } from "../gameState";
import { Keys } from "./KeyMap";
import { SpellCastType } from "../enums";
import { addLog } from "../../lib/utils";

export const handleSpellbookModeInput = ({
  key,
  player,
  state,
  setState,
}: InputContext) => {
  if (key === Keys.CAST || key === Keys.CANCEL) {
    setState((state: State) => (state.gameState = GameState.GAME));
  }

  // NOTE: inventory navigation
  const spellbookLength = player.knownSpells?.length || 0;
  const currentIndex = state.spellbookActiveIndex;

  if ((Keys.SCROLL_DOWN as readonly string[]).includes(key)) {
    if (currentIndex < spellbookLength - 1) {
      setState(
        (state: State) => (state.spellbookActiveIndex = currentIndex + 1),
      );
    } else {
      setState((state: State) => (state.spellbookActiveIndex = 0));
    }
    return true;
  }

  if ((Keys.SCROLL_UP as readonly string[]).includes(key)) {
    if (currentIndex > 0) {
      setState(
        (state: State) => (state.spellbookActiveIndex = currentIndex - 1),
      );
    } else {
      setState(
        (state: State) => (state.spellbookActiveIndex = spellbookLength - 1),
      );
    }
    return true;
  }

  if (Keys.CONFIRM === key) {
    const { knownSpells } = player;

    if (knownSpells?.length) {
      const spell = knownSpells[getState().spellbookActiveIndex];
      const spellName = spell.name;

      setState((state: State) => {
        state.gameState = GameState.CAST_SPELL;
        state.spellCastType = SpellCastType.KnownSpell;
        state.spellName = spellName;
      });
    } else {
      setState((state: State) => {
        state.gameState = GameState.GAME;
        state.spellCastType = null;
        state.spellName = null;
      });

      addLog("You do not know any spells.");
    }
    return true;
  }
};
