import { RendererContext } from "../systems/render.system";
import { GameState, getState } from "../gameState";

export const renderMenuUnderlay = ({ views }: RendererContext) => {
  const view = views.menuUnderlay;
  if (view) {
    const menuStates = [
      GameState.LOG_HISTORY,
      GameState.INVENTORY,
      GameState.SAVING,
    ];
    const { gameState } = getState();

    menuStates.includes(gameState) ? view.show() : view.hide();
  }
};
