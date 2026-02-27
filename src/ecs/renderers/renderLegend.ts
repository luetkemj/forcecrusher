import { RendererContext } from "../systems/render.system";
import { distance } from "../../lib/grid";
import { RowToken, TokenType, UpdateRow } from "../../lib/canvas";
import { GameState, getState } from "../gameState";
import { chars, colors } from "../../actors/graphics";
import { TileSet } from "../enums";
import { clamp, times } from "lodash";
import {
  getFluidWetPercent,
  getWetColor,
  getWetPercent,
  isDry,
} from "../systems/wet.system";

export const renderLegend = ({ views, queries }: RendererContext) => {
  // don't render when in SIM mode.
  const { gameState, simulationTurnsLeft } = getState();
  if (gameState === GameState.SIM && simulationTurnsLeft > 0) return;

  const view = views.legend;
  if (view) {
    const entities = [];
    const [player] = queries.pcQuery;

    for (const entity of queries.legendableQuery) {
      entities.push(entity);
    }

    entities.sort((entity) => distance(player.position, entity.position));

    view.clearView();

    const rows: Array<Array<UpdateRow>> = [];
    entities.forEach((entity) => {
      const entityChar = entity.appearance.char;
      const entityTint = entity.appearance.tint;
      const entityName = entity.name;

      if (entity.onFire) {
        rows.push([
          {
            tokens: [
              {
                type: TokenType.Glyph,
                tileSet: TileSet.Kenny,
                char: chars.fire,
                tint: colors.fire,
              },
              {
                type: TokenType.Text,
                value: ` BURNING`,
                tint: colors.fire,
                parseTags: true,
              },
            ],
          },
        ]);
      }

      rows.push([
        {
          tokens: [
            {
              type: TokenType.Glyph,
              tileSet: TileSet.Kenny,
              char: entityChar,
              tint: entityTint,
            },
            {
              type: TokenType.Text,
              value: ` ${entityName}`,
              tint: colors.text,
              parseTags: true,
            },
          ],
        },
      ]);

      if (entity.health) {
        const { max, current } = entity.health;

        const heartRows = getHearts(max, current, 12);

        heartRows.forEach((row) => {
          const tokens: Array<RowToken> = [];
          const { fullHearts, halfHearts, emptyHearts } = row;

          times(fullHearts, () => {
            tokens.push({
              type: TokenType.Glyph,
              tileSet: TileSet.Kenny,
              char: chars.heartFull,
              tint: colors.blood,
            });
          });

          times(halfHearts, () => {
            tokens.push({
              type: TokenType.Glyph,
              tileSet: TileSet.Kenny,
              char: chars.heartHalf,
              tint: colors.blood,
            });
          });

          times(emptyHearts, () => {
            tokens.push({
              type: TokenType.Glyph,
              tileSet: TileSet.Kenny,
              char: chars.heartEmpty,
              tint: colors.blood,
            });
          });

          rows.push([{ tokens }]);
        });
      }
      if (!isDry(entity)) {
        if (!entity.wet) return;

        const waterPercent = getFluidWetPercent(entity.wet.fluids.water);
        const bloodPercent = getFluidWetPercent(entity.wet.fluids.blood);
        const lavaPercent = getFluidWetPercent(entity.wet.fluids.lava);
        const oilPercent = getFluidWetPercent(entity.wet.fluids.oil);

        rows.push([
          {
            tokens: [
              {
                type: TokenType.Glyph,
                tileSet: TileSet.Kenny,
                char: chars.spellTypeFluid,
                tint: colors.water,
                alpha: waterPercent ? 1 : 0.15,
              },
              {
                type: TokenType.Text,
                value: `${waterPercent}% `,
                tint: colors.water,
                parseTags: true,
                alpha: waterPercent ? 1 : 0.15,
              },
              {
                type: TokenType.Glyph,
                tileSet: TileSet.Kenny,
                char: chars.spellTypeFluid,
                tint: colors.blood,
                alpha: bloodPercent ? 1 : 0.35,
              },
              {
                type: TokenType.Text,
                value: `${bloodPercent}% `,
                tint: colors.blood,
                parseTags: true,
                alpha: bloodPercent ? 1 : 0.35,
              },
              {
                type: TokenType.Glyph,
                tileSet: TileSet.Kenny,
                char: chars.spellTypeFluid,
                tint: colors.lava,
                alpha: lavaPercent ? 1 : 0.15,
              },
              {
                type: TokenType.Text,
                value: `${lavaPercent}% `,
                tint: colors.lava,
                parseTags: true,
                alpha: lavaPercent ? 1 : 0.15,
              },
              {
                type: TokenType.Glyph,
                tileSet: TileSet.Kenny,
                char: chars.spellTypeFluid,
                tint: colors.oil,
                alpha: oilPercent ? 1 : 0.1,
              },
              {
                type: TokenType.Text,
                value: `${oilPercent}% `,
                tint: colors.oil,
                parseTags: true,
                alpha: oilPercent ? 1 : 0.1,
              },
            ],
          },
        ]);
      }

      rows.push([]);
    });

    view.updateRows(rows);
  }
};

export const getHearts = (max: number, current: number, rowLength: number) => {
  const DIVISOR = 5;

  const totalHearts = Math.ceil(max / DIVISOR);
  const cur = clamp(current, 0, max);

  let fullHearts = Math.floor(cur / DIVISOR);
  let halfHearts = cur % DIVISOR ? 1 : 0;
  const emptyHearts = totalHearts - fullHearts - halfHearts;

  // Ensure that at full health we show only full hearts, even if max is not
  // divisible by DIVISOR (so the last heart may have smaller capacity).
  if (cur === max) {
    fullHearts = totalHearts;
    halfHearts = 0;
  }

  const hearts = [
    ...Array(fullHearts).fill("full"),
    ...Array(halfHearts).fill("half"),
    ...Array(emptyHearts).fill("empty"),
  ];
  const rows: {
    fullHearts: number;
    halfHearts: number;
    emptyHearts: number;
  }[] = [];

  for (let i = 0; i < hearts.length; i += rowLength) {
    const rowSlice = hearts.slice(i, i + rowLength);

    rows.push({
      fullHearts: rowSlice.filter((h) => h === "full").length,
      halfHearts: rowSlice.filter((h) => h === "half").length,
      emptyHearts: rowSlice.filter((h) => h === "empty").length,
    });
  }

  return rows;
};
