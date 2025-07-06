import { Entity, gameWorld } from "../ecs/engine";
import { getState, setState, State } from "../ecs/gameState";
import { calcAverageDamage } from "./combat";
import { Pos } from "./grid";
import { pull, get } from "lodash";

export const colorTag = (color: number) => {
  return `§#${color.toString(16).padStart(6, "0")}§`;
};

export const colorEntity = (entity: Entity, path = "name") => {
  const tint = entity.appearance?.tint;
  const string = get(entity, path);
  if (tint && string) {
    return `${colorTag(tint)}${string}`;
  }
};

export const colorEntityName = (entity: Entity) => {
  const name = entity.name;
  const tint = entity.appearance?.tint;
  if (tint && name) {
    return `${colorTag(tint)}${name}§reset§`;
  }
};

export const entityNamePlate = (entity?: Entity) => {
  if (!entity) return console.log("no entity");
  const tint = entity?.appearance?.tint || 0x00ff00;
  const name = entity?.name || "noname";
  const char = entity?.appearance?.char || "?";

  return `${colorTag(tint)}${char} ${name}§reset§`;
};

export const em = (string: string) => {
  return `§purple§${string}§reset§`;
};

export const logFrozenEntity = (entity: Entity) => {
  console.log(JSON.parse(JSON.stringify(entity)));
};

export const addLog = (newLog: string) => {
  const logs = getState().log;

  if (logs.length === 0) {
    setState((state: State) => state.log.push(newLog));
    return;
  }

  const lastLog = logs[logs.length - 1];

  // Check if last log already ends with a count
  const countMatch = lastLog.match(/^(.*)\s\(x(\d+)\)$/);
  if (countMatch) {
    const [_, baseLog, countStr] = countMatch;
    if (baseLog === newLog) {
      const newCount = parseInt(countStr) + 1;
      setState(
        (state: State) =>
          (state.log[logs.length - 1] = `${baseLog} (x${newCount})`),
      );
      return;
    }
  }

  // No count yet, but new log matches last log
  if (lastLog === newLog) {
    setState((state: State) => (state.log[logs.length - 1] = `${newLog} (x2)`));
  } else {
    setState((state: State) => state.log.push(newLog));
  }
};

export const outOfBounds = (pos: Pos) => {
  const { x, y } = pos;
  const { width, height } = getState().views.map!;
  return x < 0 || y < 0 || x >= width || y >= height;
};

export const isSamePosition = (blocker: Pos, blockee: Pos) => {
  if (
    blocker.x === blockee.x &&
    blocker.y === blockee.y
  ) {
    return true;
  }
  return false;
};

export const getModifier = (skill: number) => {
  return Math.floor((skill - 10) / 2);
};

export const isWielding = (equipper: Entity) => {
  if (equipper?.weaponSlot?.contents[0]) return true;
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

  equipper.averageDamage = calcAverageDamage(equipper);
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
    // recalc average damage
    equipper.averageDamage = calcAverageDamage(equipper);

    return true;
  }

  return false;
};

export const isWearing = (equipper: Entity) => {
  if (equipper?.armorSlot?.contents[0]) return true;
  return false;
};

export const getWearing = (entity: Entity) => {
  if (entity.armorSlot?.contents) {
    // if something is already equipped, put in inventory or drop
    const equippedId = entity.armorSlot.contents[0];
    if (equippedId) {
      const wearing = gameWorld.registry.get(equippedId);

      if (wearing) return wearing;
    }
  }
};

export const wear = (equipper: Entity, equipment: Entity) => {
  if (isWearing(equipper)) {
    unWear(equipper);
  }

  // equip item
  if (equipper.armorSlot?.contents) {
    equipper.armorSlot.contents[0] = equipment.id;
    gameWorld.world.removeComponent(equipment, "position");

    // remove from inventory
    if (equipper.container?.contents) {
      pull(equipper.container?.contents, equipment.id);
    }
  }
};

export const unWear = (equipper: Entity) => {
  if (equipper.armorSlot?.contents) {
    // if something is already equipped, put in inventory or drop
    const equippedId = equipper.armorSlot.contents[0];
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
    if (equipper.armorSlot?.contents) {
      equipper.armorSlot.contents = [];
    }

    return true;
  }

  return false;
};
