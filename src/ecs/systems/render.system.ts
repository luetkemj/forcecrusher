import { world, Entity } from "../engine";
import { getState } from "../../main";
import { View } from "../../lib/canvas";

const renderableEntities100 = world.with("position", "appearance", "layer100");
const renderableEntities200 = world.with("position", "appearance", "layer200");
const renderableEntities300 = world.with("position", "appearance", "layer300");
const renderableEntities400 = world.with("position", "appearance", "layer400");

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

  // render entities currently in FOV
  for (const entity of renderableEntities100) {
    if (entity.inFov) {
      renderEntity(mapView, entity, 1);
    }
  }
  for (const entity of renderableEntities200) {
    if (entity.inFov) {
      renderEntity(mapView, entity, 1);
    }
  }
  for (const entity of renderableEntities300) {
    if (entity.inFov) {
      renderEntity(mapView, entity, 1);
    }
  }
  for (const entity of renderableEntities400) {
    if (entity.inFov) {
      renderEntity(mapView, entity, 1);
    }
  }

  // render revealed entities not currently in FOV
  for (const entity of renderableEntities100) {
    if (!entity.inFov && entity.revealed) {
      renderEntity(mapView, entity, 0.35);
    }
  }
  for (const entity of renderableEntities200) {
    if (!entity.inFov && entity.revealed) {
      renderEntity(mapView, entity, 0.35);
    }
  }
  for (const entity of renderableEntities300) {
    if (!entity.inFov && entity.revealed) {
      renderEntity(mapView, entity, 0.35);
    }
  }
  for (const entity of renderableEntities400) {
    if (!entity.inFov && entity.revealed) {
      renderEntity(mapView, entity, 0.35);
    }
  }

  // make this key off of a cheat menu in state - so you can just render all the things immediately instead of having to wait a frame
  if (window.skulltooth.debug) {
    for (const entity of renderableEntities100) {
      renderEntity(mapView, entity, 1);
    }
    for (const entity of renderableEntities200) {
      renderEntity(mapView, entity, 1);
    }
    for (const entity of renderableEntities300) {
      renderEntity(mapView, entity, 1);
    }
    for (const entity of renderableEntities400) {
      renderEntity(mapView, entity, 1);
    }
  }
};
