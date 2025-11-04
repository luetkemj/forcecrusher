import { RendererContext } from "../systems/render.system";
import { getState, GameState } from "../gameState";

export const renderSaving = ({ views }: RendererContext) => {
  const view = views.saving;
  if (view && getState().gameState === GameState.SAVING) {
    view?.updateRows([[{ string: "SAVING..." }]]);
  }
};
