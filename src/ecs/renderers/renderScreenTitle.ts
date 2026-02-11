import { chars, colors } from "../../actors/graphics";
import { TokenType } from "../../lib/canvas";
import { em } from "../../lib/utils";
import { TileSet } from "../enums";
import { GameState, getState } from "../gameState";
import { RendererContext } from "../systems/render.system";

export const renderScreenTitle = ({ views }: RendererContext) => {
  const view = views.screenTitle;
  if (getState().gameState === GameState.SCREEN_TITLE) {
    const rows = [
      [
        {
          tokens: [
            {
              type: TokenType.Text,
              value: "Skulltooth 2: Forcecrusher",
              tint: colors.player,
            },
          ],
        },
      ],
      [{ string: "" }],
      [
        {
          tokens: [
            {
              type: TokenType.Text,
              value: "           ",
              tint: colors.text,
            },
            {
              type: TokenType.Glyph,
              tileSet: TileSet.Kenny,
              char: chars.skulltooth,
              tint: colors.bone,
            },
          ],
        },
      ],
      [{ string: "" }],
      [{ string: ` ${em("[Press Any Key to Start]")}` }],
    ];

    view?.clearView();
    view?.updateRows(rows, true);
    view?.show();
  } else {
    view?.hide();
  }
};
