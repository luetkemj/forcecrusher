import { world, Entity } from "../engine";
import { getState } from "../../main";
import { View } from "../../lib/canvas";

const inFovEntities100 = world.with(
  "position",
  "appearance",
  "inFov",
  "layer100",
);
const inFovEntities200 = world.with(
  "position",
  "appearance",
  "inFov",
  "layer200",
);
const inFovEntities300 = world.with(
  "position",
  "appearance",
  "inFov",
  "layer300",
);
const inFovEntities400 = world.with(
  "position",
  "appearance",
  "inFov",
  "layer400",
);

const revealedEntities200 = world
  .with("position", "appearance", "revealed", "layer200")
  .without("inFov");
const revealedEntities100 = world
  .with("position", "appearance", "revealed", "layer100")
  .without("inFov");
const revealedEntities300 = world
  .with("position", "appearance", "revealed", "layer300")
  .without("inFov");
const revealedEntities400 = world
  .with("position", "appearance", "revealed", "layer400")
  .without("inFov");

const renderEntity = (view: View, entity: Entity, alpha: number) => {
  const { appearance, position } = entity;
  if (!appearance || !position) return;

  const { char, tint, tileSet } = appearance;
  const { x, y } = position;

  view?.updateCell({
    0: { char, tint: 0x00ff00, alpha: 0, tileSet: "tile", x, y },
    1: { char, tint, alpha, tileSet, x, y },
  });
};

export const renderSystem = () => {
  const mapView = getState().views.map;
  if (!mapView) return;

  // FOV
  for (const entity of inFovEntities100) {
    renderEntity(mapView, entity, 1);
  }
  for (const entity of inFovEntities200) {
    renderEntity(mapView, entity, 1);
  }
  for (const entity of inFovEntities300) {
    renderEntity(mapView, entity, 1);
  }
  for (const entity of inFovEntities400) {
    renderEntity(mapView, entity, 1);
  }

  // REVEALED
  for (const entity of revealedEntities100) {
    renderEntity(mapView, entity, 0.35);
  }
  for (const entity of revealedEntities200) {
    renderEntity(mapView, entity, 0.35);
  }
  for (const entity of revealedEntities300) {
    renderEntity(mapView, entity, 0.35);
  }
  for (const entity of revealedEntities400) {
    renderEntity(mapView, entity, 0.35);
  }
};
