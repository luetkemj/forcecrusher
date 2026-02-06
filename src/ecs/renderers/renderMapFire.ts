import { chars, colors } from "../../actors/graphics";
import { TileSet } from "../enums";
import { GameState, getState } from "../gameState";
import { RendererContext } from "../systems/render.system";

export const renderMapFire = ({ views, world, queries }: RendererContext) => {
  const view = views.mapFire;
  if (view) {
    view.clearView();

    const [player] = queries.pcQuery;
    if (player.excludeFromSim) {
      return;
    }

    const onFireQuery = world.with("onFire", "position");

    for (const entity of onFireQuery) {
      if (entity.inFov) {
        const { x, y } = entity.position;

        view?.updateCell({
          0: {
            char: chars.fire,
            tint: colors.fire,
            tileSet: TileSet.Kenny,
            x,
            y,
            alpha: 0.75,
          },
        });
      }

      if (
        getState().gameState.startsWith(GameState.MAKER_MODE) ||
        getState().cheats.seeAll
      ) {
        const { x, y } = entity.position;

        view?.updateCell({
          0: {
            char: chars.fire,
            tint: colors.fire,
            tileSet: TileSet.Kenny,
            x,
            y,
            alpha: 0.75,
          },
        });
      }
    }
  }
};
