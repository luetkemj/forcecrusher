import { world, Entity } from "../engine";
import { getState, GameState } from "../../main";
import { View } from "../../lib/canvas";

const concatRow = (str: string, length: number): string => {
  let newStr = str;
  if (newStr.length > length) {
    const trimLength = newStr.length - (length - 3);
    newStr = newStr
      .substring(0, newStr.length - trimLength)
      .trim()
      .concat("...");
  }
  return newStr;
};

// create a gradiant across rows
const getAlpha = (index: number) => {
  if (index < 4) {
    return (100 - (5 - index) * 7) / 100;
  }

  return 1;
};

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

  {
    const logView = getState().views.log;
    if (logView) {
      // render log
      const log = getState().log;
      const messages = log.slice(Math.max(log.length - 5, 0));
      const width = logView!.width - 1;

      logView?.updateRows(
        messages.map((message: string, index: number) => {
          return [
            { string: concatRow(message, width), alpha: getAlpha(index) },
          ];
        })
      );
    }
  }

  // render controls
  const controlsView = getState().views.controls;
  if (controlsView) {
    {
      let controls = "(arrows/hjkl)Move (i)Inventory";

      if (getState().gameState === GameState.INVENTORY) {
        controls = "(i/escape)Return to Game (d)Drop (c)Consume";
      }

      controlsView?.updateRows([[], [{ string: controls }]]);
    }
  }
};
