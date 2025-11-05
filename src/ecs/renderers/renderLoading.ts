import { RendererContext } from "../systems/render.system";
import { getState, GameState } from "../gameState";

export const renderLoading = ({ views }: RendererContext) => {
  const view = views.loading;
  if (view && getState().gameState === GameState.LOADING) {
    view?.updateRows([[{ string: "LOADING..." }]]);
  }
};
