import { RendererContext } from "../systems/render.system";
import { getState, GameState } from "../gameState";

export const renderSaving = ({ views }: RendererContext) => {
  const view = views.saving;
  if (view && getState().gameState === GameState.SAVING) {
    view?.clearView();

    view.updateRow({
      string: "SAVING...",
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
