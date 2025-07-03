import { RendererContext } from "../systems/render.system";
import { getState, GameState } from "../gameState";
import { prefabs } from "../../actors";

export const renderMakerMode = ({ views }: RendererContext) => {
  const viewRight = views.makerModeRight;
  const viewLeft = views.makerModeLeft;

  if (viewRight) {
    if (getState().gameState === GameState.MAKER_MODE) {
      const rows = [[{}, { string: "MAKER MODE" }]];

      viewRight?.clearView();
      viewRight?.updateRows(rows, true);
      viewRight?.show();
    } else {
      viewRight?.hide();
    }
  }

  if (viewLeft) {
    if (getState().gameState === GameState.MAKER_MODE) {
      const rows = [[{}, { string: "MAKER MODE SELECT" }]];

      Object.values(prefabs).forEach((value) => {
        rows.push([{}, { string: ` ${value.appearance?.char} ${value.name}` }]);
      });

      viewLeft?.clearView();
      viewLeft?.updateRows(rows, true);
      viewLeft?.show();
    } else {
      viewLeft?.hide();
    }
  }
};
