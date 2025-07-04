import { InputContext } from "../systems/userInput.system";
import { GameState, State } from "../gameState";
import { Keys } from "./KeyMap";
import { prefabs } from "../../actors";

export const handleMakerModePrefabSelectInput = ({
  key,
  state,
  setState,
}: InputContext) => {
  if (key === Keys.TOGGLE_MAKER_MODE) {
    setState((state: State) => (state.gameState = GameState.GAME));

    return true;
  }

  if (
    key === Keys.CANCEL ||
    key === Keys.CONFIRM ||
    key === Keys.TOGGLE_MAKER_MODE_PREFAB_SELECT
  ) {
    setState((state: State) => (state.gameState = GameState.MAKER_MODE));

    return true;
  }

  if ((Keys.SCROLL_DOWN as readonly string[]).includes(key)) {
    const index = state.makerModePrefabSelectIndex;
    let newIndex = index + 1;
    if (newIndex >= Object.values(prefabs).length) newIndex = 0;

    state.makerModePrefabSelectIndex = newIndex;

    return true;
  }

  if ((Keys.SCROLL_UP as readonly string[]).includes(key)) {
    const index = state.makerModePrefabSelectIndex;
    let newIndex = index - 1;
    if (newIndex <= 0) newIndex = Object.values(prefabs).length - 1;

    state.makerModePrefabSelectIndex = newIndex;

    return true;
  }
};
