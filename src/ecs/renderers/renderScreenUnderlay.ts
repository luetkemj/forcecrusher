import { RendererContext } from "../systems/render.system";
import { GameState, getState } from "../gameState";

export const renderScreenUnderlay = ({ views }: RendererContext) => {
  const view = views.screenUnderlay;
  if (view) {
    const menuStates = [
      GameState.SCREEN_TITLE,
      GameState.GAME_OVER,
      GameState.SCREEN_VICTORY,
    ];
    const { gameState } = getState();

    menuStates.includes(gameState) ? view.show() : view.hide();
  }
};
