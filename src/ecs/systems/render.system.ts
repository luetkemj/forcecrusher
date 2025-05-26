import { gameWorld, Entity } from "../engine";
import { distance } from "../../lib/grid";
import { getState, GameState } from "../../main";
import { View, UpdateRow } from "../../lib/canvas";

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

// for rendering the map
const renderableEntities100 = gameWorld.world.with(
  "position",
  "appearance",
  "layer100",
);
const renderableEntities200 = gameWorld.world.with(
  "position",
  "appearance",
  "layer200",
);
const renderableEntities300 = gameWorld.world.with(
  "position",
  "appearance",
  "layer300",
);
const renderableEntities400 = gameWorld.world.with(
  "position",
  "appearance",
  "layer400",
);

// for rendering the legend
const entitiesInFov = gameWorld.world.with(
  "inFov",
  "legendable",
  "position",
  "appearance",
  "name",
);
const pcEntities = gameWorld.world.with("pc", "position");

const renderEntity = (view: View, entity: Entity, alpha: number) => {
  const { appearance, position } = entity;
  if (!appearance || !position) return;

  const { char, tint, tileSet } = appearance;
  const { x, y } = position;

  view?.updateCell({
    0: { char, tint: 0x000000, alpha: 0, tileSet: "tile", x, y },
    1: { char, tint, alpha, tileSet, x, y },
  });
};

export const renderSystem = () => {
  const mapView = getState().views.map;
  if (!mapView) return;

  // TODO:
  // clear the map before each render (this is only necessary for loading a game
  // could def find a better place for this.
  mapView.clearView();

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
    const sensesView = getState().views.senses;
    // render sensory perception
    const senses = getState().senses;
    const width = sensesView!.width - 1;
    sensesView?.updateRows([
      [{ string: concatRow(senses.feel, width) }],
      [{ string: concatRow(senses.see, width) }],
      [{ string: concatRow(senses.hear, width) }],
      [{ string: concatRow(senses.smell, width) }],
      [{ string: concatRow(senses.taste, width) }],
    ]);
  }

  {
    const legendView = getState().views.legend;
    if (legendView) {
      const entities = [];
      const [player] = pcEntities;

      for (const entity of entitiesInFov) {
        entities.push(entity);
      }

      entities.sort((entity) => distance(player.position, entity.position));

      legendView?.clearView();

      const rows: Array<Array<UpdateRow>> = [];
      entities.forEach((entity) => {
        const entityChar = entity.appearance.char;
        const entityName = entity.name;

        const string = `${entityChar} ${entityName}`;
        rows.push([{ string }]);
      });

      legendView?.updateRows(rows);
    }
  }

  // render inventory
  {
    const menuUnderlayView = getState().views.menuUnderlay;
    const inventoryView = getState().views.inventory;

    if (getState().gameState === GameState.INVENTORY) {
      // actually render the inventory
      // get player entity
      const [player] = pcEntities;
      if (!player) return;

      const rows: Array<Array<UpdateRow>> = [];
      const playerInventory = player.container?.contents || [];
      const itemsInInventory = playerInventory.map((id) =>
        gameWorld.entityById.get(id),
      );

      itemsInInventory.forEach((item) => {
        rows.push([
          {},
          {
            string: `${item?.appearance?.char} ${item?.name} ${item?.description}`,
          },
        ]);
      });

      // console.log(rows);
      menuUnderlayView?.show();
      inventoryView?.clearView();
      inventoryView?.updateRows(rows);
      inventoryView?.show();
    } else {
      menuUnderlayView?.hide();
      inventoryView?.hide();
    }
  }

  {
    const logView = getState().views.log;
    if (logView) {
      logView.clearView();
      // render log
      const log = getState().log;
      const messages = log.slice(Math.max(log.length - 5, 0));
      const width = logView!.width - 1;

      logView?.updateRows(
        messages.map((message: string, index: number) => {
          return [
            { string: concatRow(message, width), alpha: getAlpha(index) },
          ];
        }),
      );
    }
  }

  // render cursor for inspection/targeting
  {
    const [pos0, pos1] = getState().cursor;
    const cursorProps = {
      char: "",
      tint: 0x00ff77,
      tileSet: "tile",
      alpha: 0,
      x: pos0.x,
      y: pos0.y,
    };
    if (
      getState().gameState === GameState.INSPECT ||
      getState().gameState === GameState.TARGET
    ) {
      // clear last cursor
      mapView?.updateCell({
        2: { ...cursorProps, alpha: 0, x: pos0.x, y: pos0.y },
      });
      // draw new cursor
      mapView?.updateCell({
        2: { ...cursorProps, alpha: 0.25, x: pos1.x, y: pos1.y },
      });
    } else {
      // hide cursor
      mapView?.updateCell({
        2: { ...cursorProps, alpha: 0, x: pos1.x, y: pos1.y },
      });
    }
  }

  // render controls
  const controlsView = getState().views.controls;
  if (controlsView) {
    {
      let controls = "";

      if (getState().gameState === GameState.GAME) {
        controls = "(arrows/hjkl)Move (i)Inventory (L)Look";
      }

      if (getState().gameState === GameState.INSPECT) {
        controls = "(L/escape)Return to Game (arrows/hjkl)Move cursor";
      }

      if (getState().gameState === GameState.TARGET) {
        controls =
          "(t/escape)Return to Inventory (arrows/hjkl)Move cursor (enter)Throw item";
      }

      if (getState().gameState === GameState.INVENTORY) {
        controls = "(i/escape)Return to Game (d)Drop (c)Consume (t)Throw";
      }

      controlsView?.updateRows([[], [{ string: controls }]]);
    }
  }
};
