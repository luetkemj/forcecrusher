import { RendererContext } from "../systems/render.system";
import { getState, GameState } from "../gameState";

export const renderCursor = ({ views }: RendererContext) => {
  const view = views.map;
  if (view) {
    const [pos0, pos1] = getState().cursor;
    const cursorProps = {
      char: "",
      tint: 0x00ff77,
      tileSet: "tile",
      alpha: 0,
      x: pos0.x,
      y: pos0.y,
    };
    if (
      getState().gameState === GameState.INSPECT ||
      getState().gameState === GameState.TARGET
    ) {
      // clear last cursor
      view.updateCell({
        2: { ...cursorProps, alpha: 0, x: pos0.x, y: pos0.y },
      });
      // draw new cursor
      view.updateCell({
        2: { ...cursorProps, alpha: 0.25, x: pos1.x, y: pos1.y },
      });
    } else {
      // hide cursor
      view.updateCell({
        2: { ...cursorProps, alpha: 0, x: pos1.x, y: pos1.y },
      });
    }
  }
};
