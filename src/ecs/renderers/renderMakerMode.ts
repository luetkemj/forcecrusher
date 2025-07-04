import { RendererContext } from "../systems/render.system";
import { getState, GameState } from "../gameState";
import { prefabs } from "../../actors";
import { entityNamePlate } from "../../lib/utils";

export const renderMakerMode = ({ views }: RendererContext) => {
  const viewRight = views.makerModeRight;
  const viewLeft = views.makerModeLeft;
  const viewTop = views.makerModeTop;

  if (viewTop) {
    if (getState().gameState.startsWith(GameState.MAKER_MODE)) {
      let rows = [];
      if (getState().gameState === GameState.MAKER_MODE) {
        rows.push([{}, { string: "*PLACE*", tint: 0x7766ff }], [{}, {}]);
      } else {
        rows.push([{}, { string: " PLACE ", tint: 0xdddddd }], [{}, {}]);
      }

      viewTop?.clearView();
      viewTop?.updateRows(rows, true);
      viewTop?.show();
    } else {
      viewRight?.hide();
    }
  }

  if (viewRight) {
    if (getState().gameState.startsWith(GameState.MAKER_MODE)) {
      const rows = [[{}, { string: "MAKER MODE" }]];

      viewRight?.clearView();
      viewRight?.updateRows(rows, true);
      viewRight?.show();
    } else {
      viewRight?.hide();
    }
  }

  if (viewLeft) {
    if (getState().gameState.startsWith(GameState.MAKER_MODE)) {
      let rows = [];
      if (getState().gameState === GameState.MAKER_MODE_PREFAB_SELECT) {
        rows.push([{}, { string: "   *SELECT*   ", tint: 0x7766ff }], [{}, {}]);
      } else {
        rows.push([{}, { string: "    SELECT    ", tint: 0xdddddd }], [{}, {}]);
      }

      const { makerModePrefabSelectIndex: selectedIndex } = getState();

      Object.values(prefabs).forEach((value, index) => {
        if (
          index === selectedIndex &&
          getState().gameState === GameState.MAKER_MODE_PREFAB_SELECT
        ) {
          rows.push([
            {},
            {
              string: `${index === selectedIndex ? "*" : " "} ${entityNamePlate(value)}`,
            },
          ]);
        } else {
          rows.push([
            {},
            {
              string: `${index === selectedIndex ? "*" : " "} ${value.appearance?.char} ${value.name}`,
            },
          ]);
        }
      });

      viewLeft?.clearView();
      viewLeft?.updateRows(rows, true);
      viewLeft?.show();
    } else {
      viewLeft?.hide();
    }
  }
};
