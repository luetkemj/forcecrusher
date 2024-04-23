import { sortBy } from "lodash";
import { State, getState, setState } from "../../main";
// import { UpdateRow } from "../lib/canvas";

// this is not doing anything to reduce the cells that need to be rendered.
// if things slow down or we run into other issues we will need to expand onor use the toRender info from state - not really using that yet.

// const concatRow = (str: string, length: number): string => {
//   let newStr = str;
//   if (newStr.length > length) {
//     const trimLength = newStr.length - (length - 3);
//     newStr = newStr
//       .substring(0, newStr.length - trimLength)
//       .trim()
//       .concat("...");
//   }
//   return newStr;
// };
//
// // create a gradiant across rows
// const getAlpha = (index: number) => {
//   if (index < 4) {
//     return (100 - (5 - index) * 7) / 100;
//   }
//
//   return 1;
// };

export const renderSystem = () => {
  // const isPlayerQuery = getQuery(QueryTypes.IsPlayer);

  const {
    map: mapView,
    // log: logView,
    // senses: sensesView,
    // legend: legendView,
    // inventory: inventoryView,
    // menuUnderlay: menuUnderlayView,
    // controls: controlsView,
  } = getState().views;

  for (const posId of getState().toRender) {
    const eAP = getState().eAP[posId];
    if (eAP) {
      // sort entities at eap into a stack
      const entities = [];
      for (const eId of eAP) {
        const entity = getEntity(eId);
        if (!entity) return;
        entities.push(entity);
      }

      const sortedEntities = sortBy(entities, "components.layer");

      // only render top item on stack
      const entity = sortedEntities[sortedEntities.length - 1];

      const { char, tint } = entity.components.appearance!;
      const { x, y } = entity.components.position!;
      // if entity has been revealed - render accordingly
      if (entity.components.isRevealed) {
        mapView?.updateCell({
          0: { char, tint: 0x000001, alpha: 0, tileSet: "tile", x, y },
          1: { char, tint, alpha: 0.35, tileSet: "ascii", x, y },
        });
      }

      // if entity is in fov - render accordingly
      if (entity.components.isInFov) {
        mapView?.updateCell({
          0: { char, tint: 0x111111, alpha: 0, tileSet: "tile", x, y },
          1: { char, tint, alpha: 1, tileSet: "ascii", x, y },
        });
      }
    }
  }

  setState((state: State) => (state.toRender = new Set()));

  {
    // // render log
    // const log = getState().log;
    // const messages = log.slice(Math.max(log.length - 5, 0));
    // const width = logView!.width - 1;
    //
    // logView?.updateRows(
    //   messages.map((message, index) => {
    //     return [{ string: concatRow(message, width), alpha: getAlpha(index) }];
    //   }),
    // );
  }

  {
    // // render sensory perception
    // const senses = getState().senses;
    // const width = sensesView!.width - 1;
    // sensesView?.updateRows([
    //   [{ string: concatRow(senses.feel, width) }],
    //   [{ string: concatRow(senses.see, width) }],
    //   [{ string: concatRow(senses.hear, width) }],
    //   [{ string: concatRow(senses.smell, width) }],
    //   [{ string: concatRow(senses.taste, width) }],
    // ]);
  }

  // render legend
  {
    // legendView?.clearView();
    // const legend = getState().legend;
    //
    // const rows: Array<Array<UpdateRow>> = [];
    // legend.forEach((eId) => {
    //   const entity = getEntity(eId);
    //   const entityChar = entity?.components.appearance?.char;
    //   const entityName = entity?.components.name;
    //
    //   const string = `${entityChar} ${entityName}`;
    //   rows.push([{ string }]);
    // });
    //
    // legendView?.updateRows(rows);
  }

  // render inventory
  {
    // if (getState().gameState === GameState.INVENTORY) {
    //   // actually render the inventory
    //   // get player entity
    //   const [playerEId] = isPlayerQuery.entities;
    //   const playerEntity = getEntity(playerEId);
    //   if (!playerEntity) return;
    //
    //   const rows: Array<Array<UpdateRow>> = [];
    //   const playerInventory = playerEntity.components.inventory || [];
    //   const itemsInInventory = [...playerInventory].map((eId) =>
    //     getEntity(eId),
    //   );
    //
    //   itemsInInventory.forEach((item) => {
    //     rows.push([
    //       {},
    //       {
    //         string: `${item?.components.appearance?.char} ${item?.components.name}`,
    //       },
    //     ]);
    //   });
    //
    //   // console.log(rows);
    //   menuUnderlayView?.show();
    //   inventoryView?.clearView();
    //   inventoryView?.updateRows(rows);
    //   inventoryView?.show();
    // } else {
    //   menuUnderlayView?.hide();
    //   inventoryView?.hide();
    // }
  }

  // renderCursor for inspection/targeting etc
  {
    // const [pos0, pos1] = getState().cursor;
    // const cursorProps = {
    //   char: "",
    //   tint: 0x00ff77,
    //   tileSet: "tile",
    //   alpha: 0,
    //   x: pos0.x,
    //   y: pos0.y,
    // };
    // if (
    //   getState().gameState === GameState.INSPECT ||
    //   getState().gameState === GameState.TARGET
    // ) {
    //   // clear last cursor
    //   mapView?.updateCell({
    //     2: { ...cursorProps, alpha: 0, x: pos0.x, y: pos0.y },
    //   });
    //   // draw new cursor
    //   mapView?.updateCell({
    //     2: { ...cursorProps, alpha: 0.25, x: pos1.x, y: pos1.y },
    //   });
    // } else {
    //   // hide cursor
    //   mapView?.updateCell({
    //     2: { ...cursorProps, alpha: 0, x: pos1.x, y: pos1.y },
    //   });
    // }
  }

  // render controls
  {
    // let controls = "(arrows/hjkl)Move (i)Inventory";
    //
    // if (getState().gameState === GameState.INVENTORY) {
    //   controls = "(i/escape)Return to Game (d)Drop (c)Consume";
    // }
    //
    // // GameState GAME has default controls scheme set at the start.
    // // So we don't have to reset it down here.
    //
    // controlsView?.updateRows([[], [{ string: controls }]]);
  }
};
