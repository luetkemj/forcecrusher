import { RendererContext } from "../systems/render.system";
import { getState, GameState } from "../gameState";

export const renderMakerModeRight = ({ views }: RendererContext) => {
  const view = views.makerModeRight;

  if (view) {
    if (getState().gameState === GameState.MAKER_MODE) {
      const rows = [
        [{}, { string: "MAKER MODE" }],
      ];

      view?.clearView();
      view?.updateRows(rows, true);
      view?.show();
    } else {
      view?.hide();
    }
  }
};
