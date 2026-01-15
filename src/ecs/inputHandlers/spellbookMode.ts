import { InputContext } from "../systems/userInput.system";
import { GameState, State } from "../gameState";
import { Keys } from "./KeyMap";

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
    setState((state: State) => (state.gameState = GameState.CAST_SPELL));
    return true;
  }
};
