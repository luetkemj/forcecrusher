import { type Entity, gameWorld } from "../ecs/engine";
import { addLog } from "./utils";
import { DiceRoll } from "@dice-roller/rpg-dice-roller";

export function meleeAttack(attacker: Entity, target: Entity) {
  let playerInCombat = false;
  if (attacker.pc || target.pc) {
    playerInCombat = true;
  }

  const weapon = getWeapon(attacker);

  // roll attack
  const attackRoll = new DiceRoll("d20").total;
  const isCrit = attackRoll === 20;

  const { armorClass } = target;

  if (!armorClass || !target.health) return;

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

  const { armorClass } = target;

  if (!armorClass || !target.health) return;

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
      damage += new DiceRoll(damageRoll).total;
    }
    if (ranged) {
      if (attacker.dexterity) {
        damage += calcModifier(attacker.dexterity);
      }
    } else {
      if (attacker.strength) {
        damage += calcModifier(attacker.strength);
      }
    }
  }

  if (!weapon) {
    if (ranged) {
      if (attacker.dexterity) {
        damage += calcModifier(attacker.dexterity);
      }
    } else {
      if (attacker.strength) {
        damage += calcModifier(attacker.strength);
      }
    }
  }

  return Math.max(0, damage);
}

function calcModifier(skill: number) {
  return Math.floor((skill - 10) / 2);
}
