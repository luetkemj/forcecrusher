import { chars, colors } from "../../actors/graphics";
import { AlignH, AlignV, TokenType } from "../../lib/canvas";
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
          alignH: AlignH.Center,
        },
      ],
      [{ string: "" }],
      [
        {
          tokens: [
            {
              type: TokenType.Glyph,
              tileSet: TileSet.Kenny,
              char: chars.skulltooth,
              tint: colors.bone,
            },
          ],
          alignH: AlignH.Center,
        },
      ],
      [{ string: "" }],
      [{ string: `${em("[Press Any Key to Start]")}`, alignH: AlignH.Center }],
    ];

    view?.clearView();
    view?.updateRows(rows, { parseTags: true, alignV: AlignV.Middle });
    view?.show();
  } else {
    view?.hide();
  }
};
