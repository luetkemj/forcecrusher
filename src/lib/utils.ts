import { Entity, gameWorld } from "../ecs/engine";
import { getState, setState, State } from "../main";
import { Pos } from "./grid";
import { pull } from "lodash";

export const logFrozenEntity = (entity: Entity) => {
  console.log(JSON.parse(JSON.stringify(entity)));
};

export const addLog = (message: string) => {
  setState((state: State) => state.log.push(message));
};

export const outOfBounds = (pos: Pos) => {
  const { x, y } = pos;
  const { width, height } = getState().views.map!;
  return x < 0 || y < 0 || x >= width || y >= height;
};

export const isSamePosition = (blocker: Pos, blockee: Pos) => {
  if (
    blocker.x === blockee.x &&
    blocker.y === blockee.y &&
    blocker.z === blockee.z
  ) {
    return true;
  }
  return false;
};

export const isWielding = (equipper: Entity) => {
  if (equipper?.weaponSlot?.contents[0]) return true;
  return false;
};

export const wield = (equipper: Entity, equipment: Entity) => {
  if (isWielding(equipper)) {
    unWield(equipper);
  }

  // equip item
  if (equipper.weaponSlot?.contents) {
    equipper.weaponSlot.contents[0] = equipment.id;
    gameWorld.world.removeComponent(equipment, "position");

    // remove from inventory
    if (equipper.container?.contents) {
      pull(equipper.container?.contents, equipment.id);
    }
  }
};

export const unWield = (equipper: Entity) => {
  if (equipper.weaponSlot?.contents) {
    // if something is already equipped, put in inventory or drop
    const equippedId = equipper.weaponSlot.contents[0];
    if (equippedId) {
      // try to put in inventory (check if has container and container has room)
      if (
        equipper.container &&
        equipper.container.contents.length < equipper.container.slots
      ) {
        // check if eId is already in inventory and don't push if it is
        if (!equipper.container.contents.includes(equippedId)) {
          equipper.container.contents.push(equippedId);
        }
      } else {
        // if no inventory or no room just drop it.
        const equippedEntity = gameWorld.registry.get(equippedId);

        if (equippedEntity && equipper.position) {
          gameWorld.world.addComponent(equippedEntity, "position", {
            ...equipper.position,
          });
        }
      }
    }
    // clear weapon slot
    if (equipper.weaponSlot?.contents) {
      equipper.weaponSlot.contents = [];
    }

    return true;
  }

  return false;
};

export const getWielding = (entity: Entity) => {
  if (entity.weaponSlot?.contents) {
    // if something is already equipped, put in inventory or drop
    const equippedId = entity.weaponSlot.contents[0];
    if (equippedId) {
      const weilding = gameWorld.registry.get(equippedId);

      if (weilding) return weilding;
    }
  }

  return false;
};
