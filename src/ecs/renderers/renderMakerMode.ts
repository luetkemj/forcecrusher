import { RendererContext } from "../systems/render.system";
import { getState, GameState } from "../gameState";
import { prefabs } from "../../actors";

export const renderMakerMode = ({ views }: RendererContext) => {
  const viewRight = views.makerModeRight;
  const viewLeft = views.makerModeLeft;
  const viewTop = views.makerModeTop;

  if (viewTop) {
    if (getState().gameState.startsWith(GameState.MAKER_MODE)) {
      const rows = [[{}, { string: "MAKER MODE TOP" }]];

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
      const bgTint =
        getState().gameState === GameState.MAKER_MODE_PREFAB_SELECT
          ? 0x7700ff
          : 0x000000;
      const rows = [
        [
          { string: "                     ", tint: bgTint, alpha: 1 },
          { string: "  MAKER MODE SELECT" },
        ],
      ];

      const { makerModePrefabSelectIndex: selectedIndex } = getState();

      Object.values(prefabs).forEach((value, index) => {
        rows.push([
          { string: "", tint: 0x000000, alpha: 1 },
          {
            string: `${index === selectedIndex ? "*" : " "} ${value.appearance?.char} ${value.name}`,
          },
        ]);
      });

      viewLeft?.clearView();
      viewLeft?.updateRows(rows, true);
      viewLeft?.show();
    } else {
      viewLeft?.hide();
    }
  }
};
