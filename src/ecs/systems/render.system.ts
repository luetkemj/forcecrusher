import { world } from "../engine";
import { getState } from "../../main";

const pcEntities = world.with("pc", "position", "appearance");
const inFovEntities = world.with("position", "appearance", "inFov");
const revealedEntities = world.with("position", "appearance", "revealed").without("inFov");

export const renderSystem = () => {
  const mapView = getState().views.map;

  // inFOV
  for (const { appearance, position } of inFovEntities) {
    const { char, tint, tileSet } = appearance;
    const { x, y } = position;

    mapView?.updateCell({
      0: { char, tint: 0x00ff00, alpha: 0, tileSet: "tile", x, y },
      1: { char, tint, alpha: 1, tileSet, x, y },
    });
  }

  // Revealed
  for (const { appearance, position } of revealedEntities) {
    const { char, tint, tileSet } = appearance;
    const { x, y } = position;

    mapView?.updateCell({
      0: { char, tint: 0x00ff00, alpha: 0, tileSet: "tile", x, y },
      1: { char, tint, alpha: 0.35, tileSet, x, y },
    });
  }

  // Player
  for (const { appearance, position } of pcEntities) {
    const { char, tint, tileSet } = appearance;
    const { x, y } = position;

    mapView?.updateCell({
      0: { char, tint: 0x00ff00, alpha: 0, tileSet: "tile", x, y },
      1: { char, tint, alpha: 1, tileSet, x, y },
    });
  }
};
