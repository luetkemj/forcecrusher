// import {
//   ComponentTypes,
//   Entity,
//   getEntity,
//   getQuery,
//   removeComponent,
// } from "../engine";
// import { toPosId } from "../lib/grid";
// import { applyDamages, updatePosition } from "../lib/utils";
// import { getState, setState, type State } from "../main";
// import { outOfBounds } from "../lib/utils";
// import { QueryTypes } from "../queries";
//
import { world } from "../engine";
// import { getState } from "../../main";

const moveableEntities = world.with("position", "tryMove").without("paused");

export const movementSystem = () => {
  for (const entity of moveableEntities) {
    const { position, tryMove } = entity;
    position.x = tryMove.x;
    position.y = tryMove.y;
    position.z = tryMove.z;

    world.removeComponent(entity, 'tryMove')
  }
};

// export const movementSystem = () => {
//   const isTryingToMoveQuery = getQuery(QueryTypes.IsTryingToMove);
//   const isPlayerQuery = getQuery(QueryTypes.IsPlayer);
//   const [playerEId] = isPlayerQuery.entities;
//
//   isTryingToMoveQuery.entities.forEach((eId) => {
//     const entity = getEntity(eId);
//
//     // check that entity exists
//     if (!entity) return;
//     if (!entity.components.tryMove) return;
//
//     // respect map boundaries
//     if (outOfBounds(entity.components.tryMove)) return;
//
//     // get all eIds of entities at position of trymove goal
//     const posId = toPosId(entity.components.tryMove);
//     const eAP = getState().eAP[posId];
//
//     for (const targetEId of eAP) {
//       const target = getEntity(targetEId);
//
//       if (target?.components.isBlocking) {
//         // try to fight target
//         tryFight(entity, target);
//
//         // target is blocking so entity cannot move.
//         removeComponent(entity.id, ComponentTypes.TryMove);
//         return;
//       }
//     }
//
//     // Everything checks - go ahead and move
//     moveEntity(entity);
//
//     if (entity.id === playerEId) {
//       setCursor(entity);
//     }
//   });
// };
//
// const setCursor = (entity: Entity) => {
//   setState((state: State) => {
//     state.cursor = [getState().cursor[1], entity.components.position!];
//   });
// };
//
// const moveEntity = (entity: Entity) => {
//   const { x, y, z } = entity.components.tryMove!;
//   removeComponent(entity.id, ComponentTypes.TryMove);
//
//   updatePosition(entity.id, { x, y, z });
// };
//
// const tryFight = (entity: Entity, target: Entity) => {
//   if (!target?.components.health) return;
//
//   const weaponEId = entity.components.equippedWeapon;
//   if (!weaponEId) return;
//
//   const weapon = getEntity(weaponEId);
//   if (!weapon) return;
//
//   applyDamages(weapon.id, target.id);
// };
