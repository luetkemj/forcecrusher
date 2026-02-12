import { chars, colors } from "../../actors/graphics";
import { AlignH, AlignV, TokenType } from "../../lib/canvas";
import { em } from "../../lib/utils";
import { TileSet } from "../enums";
import { GameState, getState } from "../gameState";
import { RendererContext } from "../systems/render.system";

export const renderScreenGameOver = ({ views }: RendererContext) => {
  const view = views.screenDeath;
  if (getState().gameState === GameState.GAME_OVER) {
    const rows = [
      [
        {
          tokens: [
            {
              type: TokenType.Glyph,
              tileSet: TileSet.Kenny,
              char: chars.tombstone,
              tint: colors.stone,
            },
          ],
          alignH: AlignH.Center,
        },
      ],
      [
        {
          tokens: [
            {
              type: TokenType.Glyph,
              tileSet: TileSet.Kenny,
              char: chars.grass,
              tint: colors.plant,
            },
            {
              type: TokenType.Glyph,
              tileSet: TileSet.Kenny,
              char: chars.grass,
              tint: colors.plant,
            },
            {
              type: TokenType.Glyph,
              tileSet: TileSet.Kenny,
              char: chars.grass,
              tint: colors.plant,
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
              type: TokenType.Text,
              value: "You have died.",
              tint: colors.player,
            },
          ],
          alignH: AlignH.Center,
        },
      ],
      [{ string: "" }],
      [
        {
          string: `${em("[Press Escape to Restart]")}`,
          alignH: AlignH.Center,
        },
      ],
    ];

    view?.clearView();
    view?.updateRows(rows, { parseTags: true, alignV: AlignV.Middle });
    view?.show();
  } else {
    view?.hide();
  }
};
