import { random, sample, times } from "lodash";
import { chars, colors } from "../../actors/graphics";
import { AlignH, AlignV, TokenType } from "../../lib/canvas";
import { em } from "../../lib/utils";
import { TileSet } from "../enums";
import { GameState, getState } from "../gameState";
import { RendererContext } from "../systems/render.system";

export const renderScreenVictory = ({ views }: RendererContext) => {
  const view = views.screenVictory;
  if (getState().gameState === GameState.SCREEN_VICTORY) {
    const rows = [
      [
        {
          tokens: [
            {
              type: TokenType.Text,
              value: "Congratulations, you won!",
              tint: colors.text,
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

      [
        {
          tokens: [...times(3, () => getLootToken())],
          alignH: AlignH.Center,
        },
      ],
      [
        {
          tokens: [...times(5, () => getLootToken())],
          alignH: AlignH.Center,
        },
      ],
      [
        {
          tokens: [...times(7, () => getLootToken())],
          alignH: AlignH.Center,
        },
      ],
      [
        {
          tokens: [...times(9, () => getLootToken())],
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

const lootMetalColors = [colors.gold, colors.metal];

const lootGemColors = [colors.water, colors.blood, colors.lava, colors.plant];

const lootMetalChars = [
  chars.candelabra,
  chars.amulet1,
  chars.amulet2,
  chars.amulet3,
  chars.amulet4,
  chars.coin,
  chars.coin,
  chars.coins,
  chars.coins,
];

const lootGemChars = [chars.gem];

const getLootToken = () => {
  if (random(1, 10) < 4) {
    return {
      type: TokenType.Glyph,
      tileSet: TileSet.Kenny,
      char: sample(lootGemChars) || lootGemChars[0],
      tint: sample(lootGemColors) || lootGemColors[0],
    };
  } else {
    return {
      type: TokenType.Glyph,
      tileSet: TileSet.Kenny,
      char: sample(lootMetalChars) || lootMetalChars[0],
      tint: sample(lootMetalColors) || lootGemColors[0],
    };
  }
};
