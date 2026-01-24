import { RendererContext } from "../systems/render.system";
import { getState, GameState } from "../gameState";
import { chars } from "../../actors/graphics";

export const renderCursor = ({ views, queries }: RendererContext) => {
  const view = views.targeting;
  if (view) {
    const [pos0, pos1] = getState().cursor;
    const cursorProps = {
      char: "",
      tint: 0xff0077,
      tileSet: "tile",
      alpha: 0,
      x: pos0.x,
      y: pos0.y,
    };
    if (
      getState().gameState === GameState.CAST_SPELL ||
      getState().gameState === GameState.INSPECT ||
      getState().gameState === GameState.TARGET ||
      getState().gameState.startsWith(GameState.MAKER_MODE)
    ) {
      view.clearView();
      view.show();

      if (getState().gameState === GameState.CAST_SPELL) {
        const [player] = queries.pcQuery;

        const currentSpell =
          player.knownSpells?.[getState().spellbookActiveIndex];
        if (currentSpell && currentSpell.appearance) {
          cursorProps.char = currentSpell.appearance.char;
          cursorProps.tint = currentSpell.appearance.tint;
          view.updateCell({
            0: {
              ...cursorProps,
              alpha: 0.25,
              x: pos1.x,
              y: pos1.y,
            },
            1: {
              ...cursorProps,
              alpha: 1,
              x: pos1.x,
              y: pos1.y,
              tileSet: currentSpell.appearance.tileSet,
            },
          });
        }
      }

      if (getState().gameState === GameState.INSPECT) {
        view.updateCell({
          0: {
            ...cursorProps,
            char: chars.cursor,
            alpha: 1,
            x: pos1.x,
            y: pos1.y,
            tileSet: "kenny",
          },
        });
      }

      // TODO: check for the item that is being thrown and show that as a ghost inside the cursor
      if (getState().gameState === GameState.TARGET) {
        view.updateCell({
          0: {
            ...cursorProps,
            char: chars.cursor,
            alpha: 1,
            x: pos1.x,
            y: pos1.y,
            tileSet: "kenny",
          },
        });
      }

      // TODO: check for the item that is being MADE and show that as a ghost inside the cursor
      if (getState().gameState === GameState.MAKER_MODE) {
        view.updateCell({
          0: {
            ...cursorProps,
            char: chars.cursor,
            alpha: 1,
            x: pos1.x,
            y: pos1.y,
            tileSet: "kenny",
          },
        });
      }
    } else {
      view.hide();
    }
  }
};
