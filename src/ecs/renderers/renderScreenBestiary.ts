import { bestiary } from "../../actors";
import { chars, colors } from "../../actors/graphics";
import { AlignH, AlignV, TokenType } from "../../lib/canvas";
import { TileSet } from "../enums";
import { GameState, getState } from "../gameState";
import { RendererContext } from "../systems/render.system";

export const renderScreenBestiary = ({ views }: RendererContext) => {
  const view = views.screenBestiary;
  const { activeIndex } = getState().screenBestiary;
  if (getState().gameState === GameState.SCREEN_BESTIARY) {
    const rows = [
      [
        {
          tokens: [
            {
              type: TokenType.Text,
              value: "Bestiary",
              tint: colors.text,
            },
          ],
          alignH: AlignH.Left,
        },
      ],
      [{ string: "" }],
      ...bestiary.map((prefab, index) => [
        {
          tokens: [
            {
              type: TokenType.Text,
              value: index === activeIndex ? " * " : "   ",
              tint: colors.text,
              parseTags: true,
            },

            {
              type: TokenType.Glyph,
              tileSet: TileSet.Kenny,
              char: prefab.appearance?.char || chars.default,
              tint: prefab.appearance?.tint || colors.default,
            },

            {
              type: TokenType.Text,
              value: ` ${prefab.name}`,
              tint: colors.text,
              parseTags: true,
            },
          ],
          alignH: AlignH.Left,
        },
      ]),
    ];

    view?.clearView();
    view?.updateRows(rows, { parseTags: true, alignV: AlignV.Top });
    view?.show();
  } else {
    view?.hide();
  }
};
