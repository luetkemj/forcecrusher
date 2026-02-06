import { toPos } from "../../lib/grid";
import { TileSet } from "../enums";
import { getState } from "../gameState";
import { RendererContext } from "../systems/render.system";

export const renderVisionMap = ({ views }: RendererContext) => {
  const view = views.visionMap;
  if (view) {
    if (getState().cheats.seeVisionMap) {
      view.show();
      view.clearView();
      getState().visionMap.forEach((fov) => {
        for (const posId of fov.fov) {
          view?.updateCell({
            0: {
              char: "",
              tint: 0x0ff0f0,
              alpha: 0.25,
              tileSet: TileSet.Tile,
              ...toPos(posId),
            },
          });
        }
      });
    } else {
      view.hide();
    }
  }
};
