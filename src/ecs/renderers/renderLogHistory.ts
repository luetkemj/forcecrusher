import { RendererContext } from "../systems/render.system";
import { getState, GameState } from "../gameState";

export const renderLogHistory = ({ views }: RendererContext) => {
  const view = views.logHistory;

  if (view) {
    const sliceStart = getState().logActiveIndex;
    const sliceEnd = sliceStart + 39;

    const getStartRow = () => {
      if (sliceStart === 0) return [{ string: "---" }];
      return [{ string: "..." }];
    };
    const getEndRow = () => {
      if (sliceEnd === getState().log.length) return [{ string: "---" }];
      return [{ string: "..." }];
    };

    if (getState().gameState === GameState.LOG_HISTORY) {
      const rows = [
        [{ string: "History" }],
        [],
        getStartRow(),
        ...getState()
          .log.slice(sliceStart, sliceEnd)
          .map((entry) => [{ string: entry }]),
        getEndRow(),
        [],
      ];

      view?.clearView();
      view?.updateRows(rows, true);
      view?.show();
    } else {
      view?.hide();
    }
  }
};
