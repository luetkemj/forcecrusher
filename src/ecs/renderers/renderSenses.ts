import { RendererContext, concatRow } from "../systems/render.system";
import { getState } from "../gameState";

export const renderSenses = ({ views }: RendererContext) => {
  const view = views.senses;
  if (view) {
    // render sensory perception
    const senses = getState().senses;
    const width = view!.width - 1;

    view?.updateRows([
      [{ string: concatRow(senses.feel, width) }],
      [{ string: concatRow(senses.see, width) }],
      [{ string: concatRow(senses.hear, width) }],
      [{ string: concatRow(senses.smell, width) }],
      [{ string: concatRow(senses.taste, width) }],
    ]);
  }
};
