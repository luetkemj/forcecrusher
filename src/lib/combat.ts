import { type Entity, gameWorld } from "../ecs/engine";
import { addLog, getModifier } from "./utils";
import { DiceRoll } from "@dice-roller/rpg-dice-roller";

export function getArmorClass(entity: Entity) {
  const { baseArmorClass = 10, armorSlot, dexterity } = entity;
  let armorClass = 0;
  let dexMod = 0;
  let armorAC = 0;

  armorClass = baseArmorClass;

  if (dexterity) {
    dexMod = getModifier(dexterity);
  }

  // check for armor
  if (armorSlot && armorSlot?.contents[0]) {
    const armor = gameWorld.registry.get(armorSlot.contents[0]);
    armorAC = armor?.armorClass || 0;
    if (armor?.armorClassMod === "dexterity") {
      armorAC += dexMod;
    }
  }

  return armorClass + armorAC;
}

export function meleeAttack(attacker: Entity, target: Entity) {
  let playerInCombat = false;
  if (attacker.pc || target.pc) {
    playerInCombat = true;
  }

  const weapon = getWeapon(attacker);

  // roll attack
  const attackRoll = new DiceRoll("d20").total;
  const isCrit = attackRoll === 20;

  const armorClass = getArmorClass(target);

  if (!target.health) return;

  if (attackRoll >= armorClass) {
    // NOTE: HIT
    let damage = calcDamage(attacker, false);
    if (isCrit) damage *= 2;

    target.health.current -= damage;

    if (playerInCombat) {
      let log = `${attacker.name} hits ${target.name}`;
      if (weapon) {
        log += ` with ${weapon.name}`;
      }
      log += ` for ${damage} hp!`;
      if (isCrit) log = `Critical! ${log}`;
      addLog(log);
    }
  } else {
    // NOTE: MISS
    if (playerInCombat) {
      addLog(`${attacker.name} misses ${target.name}!`);
    }
  }
}

export function rangeAttack(attacker: Entity, target: Entity, missile: Entity) {
  let playerInCombat = false;
  if (attacker.pc || target.pc) {
    playerInCombat = true;
  }
  // roll attack
  const attackRoll = new DiceRoll("d20").total;

  const isCrit = attackRoll === 20;

  const armorClass = getArmorClass(target);

  if (!target.health) return;

  if (attackRoll >= armorClass) {
    // NOTE: HIT
    let damage = calcDamage(attacker, true);
    if (isCrit) damage *= 2;

    target.health.current -= damage;

    if (playerInCombat) {
      let log = `${attacker.name} hits ${target.name} with ${missile.name} for ${damage} hp!`;
      if (isCrit) log = `Critical! ${log}`;
      addLog(log);
    }
  } else {
    // NOTE: MISS
    if (playerInCombat) {
      addLog(`${attacker.name} misses ${target.name}!`);
    }
  }
}

// TODO: should this return an ability if no weapon? Rats should bite...
// it needs to be deterministic
function getWeapon(entity: Entity) {
  const weaponId = entity.weaponSlot?.contents[0];
  if (weaponId) {
    return gameWorld.registry.get(weaponId);
  }
  return false;
}

// TODO: take weapon as arg - weapon will have damage type, melee/ranged, finesse, and damage dice etc
function calcDamage(attacker: Entity, ranged: boolean) {
  let damage = 0;
  const weapon = getWeapon(attacker);

  if (weapon) {
    const damageRoll = weapon?.damageRoll;

    if (damageRoll) {
      const roll = new DiceRoll(damageRoll).total;
      damage += roll;
    }
    if (ranged) {
      if (attacker.dexterity) {
        const mod = getModifier(attacker.dexterity);
        damage += mod;
      }
    } else {
      if (attacker.strength) {
        const mod = getModifier(attacker.strength);
        damage += mod;
      }
    }
  }

  if (!weapon) {
    if (ranged) {
      if (attacker.dexterity) {
        damage += getModifier(attacker.dexterity);
      }
    } else {
      if (attacker.strength) {
        damage += getModifier(attacker.strength);
      }
    }
  }

  return Math.max(0, damage);
}
