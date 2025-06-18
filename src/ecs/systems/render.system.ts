import { IGameWorld, Entity } from "../engine";
import { distance } from "../../lib/grid";
import { getState, GameState } from "../gameState";
import { View, UpdateRow } from "../../lib/canvas";
import { colorTag, getWielding, getWearing, em } from "../../lib/utils";
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
          const entityTint = entity.appearance.tint;
          const entityName = entity.name;

          const string = `${colorTag(entityTint)}${entityChar} ${entityName}`;
          rows.push([{ string }]);
        });

        legendView?.updateRows(rows, true);
      }
    }

    {
      // NOTE: MENUS
      const menuUnderlayView = getState().views.menuUnderlay;
      if (
        [GameState.LOG_HISTORY, GameState.INVENTORY].includes(
          getState().gameState,
        )
      ) {
        menuUnderlayView?.show();
      } else {
        menuUnderlayView?.hide();
      }

      // render history
      {
        const historyView = getState().views.logHistory;

        const sliceStart = getState().logActiveIndex;
        const sliceEnd = sliceStart + 39;

        const getStartRow = () => {
          if (sliceStart === 0) return [{ string: "---" }];
          return [{ string: "..." }];
        };
        const getEndRow = () => {
          if (sliceEnd === getState().log.length) return [{ string: "---" }];
          return [{ string: "..." }];
        };

        if (getState().gameState === GameState.LOG_HISTORY) {
          const rows = [
            [{ string: "History" }],
            [],
            getStartRow(),
            ...getState()
              .log.slice(sliceStart, sliceEnd)
              .map((entry) => [{ string: entry }]),
            getEndRow(),
            [],
          ];

          historyView?.clearView();
          historyView?.updateRows(rows, true);
          historyView?.show();
        } else {
          historyView?.hide();
        }
      }

      // render inventory
      {
        const inventoryView = getState().views.inventory;

        if (getState().gameState === GameState.INVENTORY) {
          // actually render the inventory
          // get player entity
          const [player] = pcQuery;
          if (!player) return;

          // const rows: Array<Array<UpdateRow>> = [];
          const playerInventory = player.container?.contents || [];
          const itemsInInventory = playerInventory.map((id) =>
            registry.get(id),
          );
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

          inventoryView?.clearView();
          inventoryView?.updateRows(rows);
          inventoryView?.show();
        } else {
          inventoryView?.hide();
        }
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
          true,
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
    let weaponString;
    if (wielding) {
      weapon = wielding.name;
      const tint = wielding.appearance?.tint || 0x00ff00;
      weaponString = `${colorTag(tint)}): ${weapon}`;
    } else {
      weaponString = `): ${weapon}`;
    }

    let armor = "unarmored";
    const wearing = getWearing(player);
    let armorString;
    if (wearing) {
      armor = wearing.name;
      const tint = wearing.appearance?.tint || 0x00ff00;
      armorString = `${colorTag(tint)}]: ${armor}`;
    } else {
      armorString = `]: ${armor}`;
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
        [{ string: `${weaponString}§reset§ (${player.averageDamage})` }],
        [{ string: `${armorString}§reset§ [${getArmorClass(player)}]` }],
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
      hudView?.updateRows(rows, true);
    }

    // render controls
    const controlsView = getState().views.controls;
    if (controlsView) {
      {
        let controls = "";

        if (getState().gameState === GameState.GAME) {
          controls = `(${em("arrows/hjkl")})Move (${em("g")})Get (${em("H")})History (${em("i")})Inventory (${em("L")})Look`;
        }

        if (getState().gameState === GameState.INSPECT) {
          controls = `(${em("L/escape")})Return to Game (${em("arrows/hjkl")})Move cursor`;
        }

        if (getState().gameState === GameState.TARGET) {
          controls = `(${em("t/escape")})Return to Inventory (${em("arrows/hjkl")})Move cursor (${em("enter")})Throw item`;
        }

        if (getState().gameState === GameState.INVENTORY) {
          controls = `(${em("i/escape")})Return to Game (${em("c")})Consume (${em("d")})Drop (${em("t")})Throw (${em("W")})Wear (${em("w")})Wield (${em("r")})Remove`;
        }

        if (getState().gameState === GameState.LOG_HISTORY) {
          controls = `(${em("H/escape")})Return to Game (${em("arrows/jk")})Scroll history`;
        }

        controlsView?.updateRows([[], [{ string: controls }]], true);
      }
    }
  };
};

// NOTE:
// this in now a NOOP
// TODO: update this to remove colorTags
const concatRow = (str: string, length: number): string => {
  let newStr = str;
  if (newStr.length > length) {
    const trimLength = newStr.length - (length - 3);
    newStr = newStr
      .substring(0, newStr.length - trimLength)
      .trim()
      .concat("...");
  }
  return str;
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
