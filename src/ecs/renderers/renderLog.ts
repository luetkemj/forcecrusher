import { RendererContext, concatRow, getAlpha } from "../systems/render.system";
import { getState } from "../gameState";

export const renderLog = ({ views }: RendererContext) => {
  const view = views.log;
  if (view) {
    view.clearView();
    const log = getState().log;
    const messages = log.slice(Math.max(log.length - 5, 0));
    const width = view!.width - 1;

    view?.updateRows(
      messages.map((message: string, index: number) => {
        return [{ string: concatRow(message, width), alpha: getAlpha(index) }];
      }),
      true,
    );
  }
};
