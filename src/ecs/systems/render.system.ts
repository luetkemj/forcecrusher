import { world } from "../engine";
import { getState } from "../../main";

const renderableEntities = world
  .with("position", "appearance")
  .without("paused");

export const renderSystem = () => {
  const mapView = getState().views.map;

  for (const { appearance, position } of renderableEntities) {
    const { char, tint, tileSet } = appearance;
    const { x, y } = position;

    mapView?.updateCell({
      0: { char, tint: 0x00ff00, alpha: 0, tileSet: "tile", x, y },
      1: { char, tint, alpha: 1, tileSet, x, y },
    });
  }
};
