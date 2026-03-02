import { chars, colors } from "../../actors/graphics";
import { AlignH, AlignV, TokenType } from "../../lib/canvas";
import { em } from "../../lib/utils";
import { TileSet } from "../enums";
import { GameState, getState } from "../gameState";
import { LeaderboardEntry, loadLeaderboard } from "../saveStore";
import { RendererContext } from "../systems/render.system";

export const renderScreenTitle = async ({ views }: RendererContext) => {
  const view = views.screenTitle;

  const leaderboard = (await loadLeaderboard()) || [];
  const scoreLength = leaderboard[0].score.toString().length || 0;

  // TODO: calculate padding for longest entry
  // screen width - length of longest entity / 2

  const highscore = [
    [{ string: `* High Scores *`, alignH: AlignH.Center }],
    [{ string: ``, alignH: AlignH.Center }],
    ...leaderboard.map((entry: LeaderboardEntry, index: number) => {
      return [
        {
          tokens: [
            {
              type: TokenType.Text,
              value: " ".repeat(70),
              tint: colors.text,
            },
            {
              type: TokenType.Text,
              value: `${index + 1}) `,
              tint: colors.text,
            },
            {
              type: TokenType.Text,
              value: `${entry.score}`.padStart(scoreLength, " "),
              tint: colors.text,
            },
            {
              type: TokenType.Glyph,
              tileSet: TileSet.Kenny,
              char: chars.coins,
              tint: colors.gold,
            },

            {
              type: TokenType.Text,
              value: ` ${entry.date}: `,
              tint: colors.text,
            },
            {
              type: TokenType.Text,
              value: `${entry.cod}`,
              tint: colors.text,
            },
            {
              type: TokenType.Text,
              value: ` on turn ${entry.turn}`,
              tint: colors.text,
            },
          ],
        },
      ];
    }),
  ];

  if (getState().gameState === GameState.SCREEN_TITLE) {
    const rows = [
      [
        {
          tokens: [
            {
              type: TokenType.Text,
              value: "Skulltooth 2: Forcecrusher",
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
      [{ string: "" }],
      [{ string: `${em("[Press Any Key to Start]")}`, alignH: AlignH.Center }],
      [],
      [],
      ...highscore,
    ];

    view?.clearView();
    view?.updateRows(rows, { parseTags: true, alignV: AlignV.Middle });
    view?.show();
  } else {
    view?.hide();
  }
};
