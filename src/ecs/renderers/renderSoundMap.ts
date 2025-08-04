import { toPos } from "../../lib/grid";
import { getState } from "../gameState";
import { RendererContext } from "../systems/render.system";

export const renderSoundMap = ({ views }: RendererContext) => {
  const view = views.soundMap;
  if (view) {
    if (getState().cheats.seeSoundMap) {
      view.show();
      view.clearView();
      if (getState().soundMap) {
        for (const [posId, sounds] of getState().soundMap.entries()) {
          // only show player sounds
          // let totalStrength = sounds[getState().playerId] || 0;
          // show all sounds
          let totalStrength = 0;
          for (const [_, strength] of Object.entries(sounds)) {
            totalStrength += strength;
          }

          const normalized = (totalStrength / 30) * 0.3;
          const clamped = Math.min(1, normalized);

          view?.updateCell({
            0: {
              char: "",
              tint: 0x0ff0f0,
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
