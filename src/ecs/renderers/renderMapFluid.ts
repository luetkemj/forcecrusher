import { GameState, getState } from "../gameState";
import { RendererContext } from "../systems/render.system";

export const renderMapFluid = ({ views, world }: RendererContext) => {
  const view = views.mapFluid;
  if (view) {
    view.clearView();

    const fluidContainerQuery = world.with("fluidContainer", "position");

    for (const entity of fluidContainerQuery) {
      const { x, y } = entity.position;
      const alpha =
        entity.fluidContainer.volume / entity.fluidContainer.maxVolume;
      if (entity.inFov) {
        view?.updateCell({
          0: {
            char: "",
            tint: entity.fluidContainer.fluidType?.tint || 0xffffff,
            tileSet: "tile",
            x,
            y,
            alpha,
          },
        });
      }
      if (!entity.inFov && entity.revealed) {
        view?.updateCell({
          0: {
            char: "",
            tint: 0x134d8f,
            tileSet: "tile",
            x,
            y,
            alpha,
          },
        });
      }

      if (
        getState().gameState.startsWith(GameState.MAKER_MODE) ||
        getState().cheats.seeAll
      ) {
        view?.updateCell({
          0: {
            char: "",
            tint: entity.fluidContainer.fluidType?.tint || 0xffffff,
            tileSet: "tile",
            x,
            y,
            alpha,
          },
        });
      }
    }
  }
};
