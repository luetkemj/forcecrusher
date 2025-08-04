import { toPos } from "../../lib/grid";
import { getState } from "../gameState";
import { RendererContext } from "../systems/render.system";

export const renderOdorMap = ({ views }: RendererContext) => {
  const view = views.odorMap;
  if (view) {
    if (getState().cheats.seeOdorMap) {
      view.show();
      view.clearView();
      if (getState().odorMap) {
        for (const [posId, odors] of getState().odorMap.entries()) {
          // only show player odors
          // let totalStrength = odors[getState().playerId] || 0;
          // show all odors
          let totalStrength = 0;
          for (const [_, { strength }] of Object.entries(odors)) {
            totalStrength += strength;
          }

          const normalized = (totalStrength / 30) * 0.3;
          const clamped = Math.min(1, normalized);

          view?.updateCell({
            0: {
              char: "",
              tint: 0xffff00,
              alpha: clamped,
              tileSet: "tile",
              ...toPos(posId),
            },
          });
        }
      }
    } else {
      view.hide();
    }
  }
};
