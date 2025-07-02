import { GameState, getState } from "../gameState";
import { RendererContext, renderEntity } from "../systems/render.system";

export const renderMap = ({ views, queries }: RendererContext) => {
  const view = views.map;
  if (view) {
    // TODO: clear the map before each render (this is only necessary for loading a game
    // could def find a better place for this.
    view.clearView();

    const allLayers = [
      queries.renderable100Query,
      queries.renderable200Query,
      queries.renderable300Query,
      queries.renderable400Query,
    ];

    // render everything in FOV
    for (const query of allLayers) {
      for (const entity of query) {
        if (entity.inFov) renderEntity(view, entity, 1);
      }
    }

    // render all revealed but NOT in FOV
    for (const query of allLayers) {
      for (const entity of query) {
        if (!entity.inFov && entity.revealed && !entity.ai)
          renderEntity(view, entity, 0.35);
      }
    }

    if (getState().gameState === GameState.MAKER_MODE) {
      for (const query of allLayers) {
        for (const entity of query) {
          renderEntity(view, entity, 1);
        }
      }
    }
  }
};
