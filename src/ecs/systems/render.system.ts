import { IGameWorld, Entity } from "../engine";
import { distance } from "../../lib/grid";
import { getState, GameState } from "../../main";
import { View, UpdateRow } from "../../lib/canvas";
import { getWielding, getWearing } from "../../lib/utils";
import { getArmorClass } from "../../lib/combat";

export const createRenderSystem = (
  world: IGameWorld["world"],
  registry: IGameWorld["registry"],
) => {
  const renderable100Query = world.with("position", "appearance", "layer100");
  const renderable200Query = world.with("position", "appearance", "layer200");
  const renderable300Query = world.with("position", "appearance", "layer300");
  const renderable400Query = world.with("position", "appearance", "layer400");

  // for rendering the legend
  const inFovQuery = world.with(
    "inFov",
    "legendable",
    "position",
    "appearance",
    "name",
  );
  const pcQuery = world.with("pc", "position");

  return function system() {
    const mapView = getState().views.map;
    if (!mapView) return;

    // TODO: clear the map before each render (this is only necessary for loading a game
    // could def find a better place for this.
    mapView.clearView();

    // render entities currently in FOV
    for (const entity of renderable100Query) {
      if (entity.inFov) {
        renderEntity(mapView, entity, 1);
      }
    }
    for (const entity of renderable200Query) {
      if (entity.inFov) {
        renderEntity(mapView, entity, 1);
      }
    }
    for (const entity of renderable300Query) {
      if (entity.inFov) {
        renderEntity(mapView, entity, 1);
      }
    }
    for (const entity of renderable400Query) {
      if (entity.inFov) {
        renderEntity(mapView, entity, 1);
      }
    }

    // render revealed entities not currently in FOV
    for (const entity of renderable100Query) {
      if (!entity.inFov && entity.revealed) {
        renderEntity(mapView, entity, 0.35);
      }
    }
    for (const entity of renderable200Query) {
      if (!entity.inFov && entity.revealed) {
        renderEntity(mapView, entity, 0.35);
      }
    }
    for (const entity of renderable300Query) {
      if (!entity.inFov && entity.revealed) {
        renderEntity(mapView, entity, 0.35);
      }
    }
    for (const entity of renderable400Query) {
      if (!entity.inFov && entity.revealed) {
        renderEntity(mapView, entity, 0.35);
      }
    }

    // make this key off of a cheat menu in state - so you can just render all the things immediately instead of having to wait a frame
    if (window.skulltooth.debug) {
      for (const entity of renderable100Query) {
        renderEntity(mapView, entity, 1);
      }
      for (const entity of renderable200Query) {
        renderEntity(mapView, entity, 1);
      }
      for (const entity of renderable300Query) {
        renderEntity(mapView, entity, 1);
      }
      for (const entity of renderable400Query) {
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
        const [player] = pcQuery;

        for (const entity of inFovQuery) {
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
        const [player] = pcQuery;
        if (!player) return;

        // const rows: Array<Array<UpdateRow>> = [];
        const playerInventory = player.container?.contents || [];
        const itemsInInventory = playerInventory.map((id) => registry.get(id));
        const activeIndex = getState().inventoryActiveIndex;

        const wieldingEId = player.weaponSlot?.contents[0] || "";
        const wieldedEntity = registry.get(wieldingEId);
        const armor = getWearing(player);

        const rows = [
          [{}, { string: "Inventory" }],
          [],
          [
            {},
            {
              string: `${player.container?.name} [${player.container?.contents.length}/${player.container?.slots}]`,
            },
          ],
          ...itemsInInventory.map((item, index) => [
            {},
            {
              string: `${activeIndex === index ? "*" : " "} ${item?.appearance?.char} ${item?.name} ${item?.description}`,
            },
          ]),
          [],
          [
            {},
            {
              string: `Wielding [${player.weaponSlot?.contents.length}/${player.weaponSlot?.slots}]`,
            },
          ],
          [
            {},
            {
              string: `  ${wieldedEntity?.appearance?.char} ${wieldedEntity?.name} ${wieldedEntity?.description}`,
            },
          ],
          [],
          [
            {},
            {
              string: `Wearing [${player.armorSlot?.contents.length}/${player.armorSlot?.slots}]`,
            },
          ],
          [
            {},
            {
              string: `  ${armor && armor?.appearance?.char} ${armor && armor?.name} ${armor && armor?.description}`,
            },
          ],
        ];

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

    const hudView = getState().views.hud;
    const [player] = pcQuery;
    let weapon = "unarmed";
    const wielding = getWielding(player);
    if (wielding) {
      weapon = wielding.name;
    }

    let armor = "unarmored";
    const wearing = getWearing(player);
    if (wearing) {
      armor = wearing.name;
    }
    if (hudView) {
      const rows = [
        [{ string: `Forcecrusher` }],
        [],
        [{ string: `Zone: ${getState().zoneId}` }],
        [],
        [{ string: `LV: 1` }],
        [{ string: `HP: ${player?.health?.current}/${player?.health?.max}` }],
        [],
        [{ string: `): ${weapon} (${player.averageDamage})` }],
        [{ string: `]: ${armor} [${getArmorClass(player)}]` }],
        [],
        [{ string: `AC: ${getArmorClass(player)}` }],
        [{ string: `DM: ${player.averageDamage}` }],
        [],
        [{ string: `ST: ${player?.strength}` }],
        [{ string: `DX: ${player?.dexterity}` }],
        [{ string: `CN: ${player?.constitution}` }],
        [{ string: `IN: ${player?.intelligence}` }],
        [{ string: `WI: ${player?.wisdom}` }],
        [{ string: `CH: ${player?.charisma}` }],
      ];

      hudView?.clearView();
      hudView?.updateRows(rows);
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
          controls =
            "(i/escape)Return to Game (c)Consume (d)Drop (t)Throw (W)Wear (w)Wield (r)Remove";
        }

        controlsView?.updateRows([[], [{ string: controls }]]);
      }
    }
  };
};

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
