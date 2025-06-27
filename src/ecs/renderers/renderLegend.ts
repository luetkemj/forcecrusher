import { RendererContext } from "../systems/render.system";
import { distance } from "../../lib/grid";
import { UpdateRow } from "../../lib/canvas";
import { colorTag } from "../../lib/utils";

export const renderLegend = ({ views, queries }: RendererContext) => {
  const view = views.legend;
  if (view) {
    const entities = [];
    const [player] = queries.pcQuery;

    for (const entity of queries.inFovQuery) {
      entities.push(entity);
    }

    entities.sort((entity) => distance(player.position, entity.position));

    view.clearView();

    const rows: Array<Array<UpdateRow>> = [];
    entities.forEach((entity) => {
      const entityChar = entity.appearance.char;
      const entityTint = entity.appearance.tint;
      const entityName = entity.name;

      const string = `${colorTag(entityTint)}${entityChar} ${entityName}`;
      rows.push([{ string }]);
    });

    view?.updateRows(rows, true);
  }
};
