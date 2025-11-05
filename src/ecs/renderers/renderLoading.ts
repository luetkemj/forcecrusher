import { RendererContext } from "../systems/render.system";
import { getState, GameState } from "../gameState";

export const renderLoading = ({ views }: RendererContext) => {
  const view = views.loading;
  if (view && getState().gameState === GameState.LOADING) {
    view?.clearView();

    view.updateRow({
      string: "LOADING...",
      layer: 0,
      x: 0,
      y: 0,
      tint: 0xff0033,
    });
    view?.show();
  } else {
    view?.hide();
  }
};
