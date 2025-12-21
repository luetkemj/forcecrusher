import { map } from "lodash";
import { GameState, getState } from "../gameState";
import { RendererContext, renderEntity } from "../systems/render.system";
import { mixHexWeighted } from "../../lib/utils";

export const renderMap = ({ views, queries }: RendererContext) => {
  const view = views.map;
  if (view) {
    // TODO: clear the map before each render (this is only necessary for loading a game/clearing omciscience
    // Do this only when needed as it's kinda expensive.
    view.clearView();

    const [player] = queries.pcQuery;
    if (player.excludeFromSim) {
      return;
    }

    const allLayers = [
      queries.renderable100Query,
      queries.renderable125Query,
      // queries.renderable150Query, Fluids - rendered in renderMapFluids
      queries.renderable200Query,
      queries.renderable225Query,
      queries.renderable250Query,
      queries.renderable300Query,
      queries.renderable325Query,
      queries.renderable350Query,
      queries.renderable400Query,
    ];

    // render everything in FOV
    for (const query of allLayers) {
      for (const entity of query) {
        if (entity.fluidContainer && entity.fluidContainer.renderFluidColor) {
          // get composite fluid color
          const colors = map(entity.fluidContainer.fluids, (x) => x.tint);
          const weights = map(entity.fluidContainer.fluids, (x) => x.volume);
          const fluidColor = mixHexWeighted(colors, weights);
          if (fluidColor) {
            entity.appearance.tint = mixHexWeighted(colors, weights);
          }
        }

        if (entity.inFov) renderEntity(view, entity, 1, 0);
      }
    }

    // render all revealed but NOT in FOV
    for (const query of allLayers) {
      for (const entity of query) {
        if (!entity.inFov && entity.revealed && !entity.ai)
          renderEntity(view, entity, 0.35, 0x134d8f);
      }
    }

    if (
      getState().gameState.startsWith(GameState.MAKER_MODE) ||
      getState().cheats.seeAll
    ) {
      for (const query of allLayers) {
        for (const entity of query) {
          renderEntity(view, entity, 1, 0);
        }
      }
    }
  }
};
