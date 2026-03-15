import { RendererContext, concatRow } from "../systems/render.system";
import { getState } from "../gameState";

export const renderSenses = ({ views }: RendererContext) => {
  const view = views.senses;
  if (view) {
    // render sensory perception
    const senses = getState().senses;
    const width = view!.width - 1;

    const sight = `VI: ${senses.sight || ""}`;
    const hearing = `AU: ${senses.hearing || ""}`;
    const smell = `SM: ${senses.smell || ""}`;
    const taste = `TS: ${senses.taste || ""}`;
    const touch = `TO: ${senses.touch || ""}`;

    view?.updateRows([
      [{ string: concatRow(sight, width) }],
      [{ string: concatRow(hearing, width) }],
      [{ string: concatRow(smell, width) }],
      [{ string: concatRow(taste, width) }],
      [{ string: concatRow(touch, width) }],
    ]);
  }
};
