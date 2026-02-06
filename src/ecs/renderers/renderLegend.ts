import { RendererContext } from "../systems/render.system";
import { distance } from "../../lib/grid";
import { TokenType, UpdateRow } from "../../lib/canvas";
import { GameState, getState } from "../gameState";
import { colors } from "../../actors/graphics";
import { TileSet } from "../enums";

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
    });

    view.updateRows(rows);
  }
};
