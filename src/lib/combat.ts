import { type Entity, type Attack, gameWorld } from "../ecs/engine";
import { sample } from "lodash";
import { addLog, getModifier, isWearing, getWearing } from "./utils";
import { DiceRoll } from "@dice-roller/rpg-dice-roller";

export function getAverageRoll(notation: String) {
  const nRolls = 500;
  const r1k = Array(nRolls).fill(notation).join(",");
  const roll = new DiceRoll(`{${r1k}}`);
  return Math.round(roll.averageTotal / nRolls);
}

export function getArmorClass(entity: Entity) {
  const { baseArmorClass = 10, dexterity } = entity;
  let dexMod = dexterity ? getModifier(dexterity) : 0;

  // if wearing armor
  if (!isWearing(entity)) {
    return baseArmorClass + dexMod;
  } else {
    const armor = getWearing(entity);
    if (armor) {
      const armorClass = armor.armorClass || 10;
      if (armor.armorClassMod === "dexterity") {
        return armorClass + dexMod;
      } else {
        return armorClass;
      }
    }
  }
}

export function meleeAttack(attacker: Entity, target: Entity) {
  let playerInCombat = false;
  if (attacker.pc || target.pc) {
    playerInCombat = true;
  }

  const weapon = getWeapon(attacker);
  let attack = getAttack(attacker);

  if (!attack) {
    console.log(`${attacker.name} has no means of attack`);
    return;
  }

  // roll attack
  // TODO: should this have any toHit bonuses?
  const attackRoll = new DiceRoll("d20").total;
  const isCrit = attackRoll === 20;

  const armorClass = getArmorClass(target) || 0;

  if (!target.health) return;

  if (attackRoll >= armorClass) {
    // NOTE: HIT
    let damage = calcAttackDamage(attacker, attack);
    if (isCrit) damage *= 2;

    target.health.current -= damage;

    if (playerInCombat) {
      let log = `${attacker.name} ${attack.verb} ${target.name}`;
      if (weapon) {
        log += ` with ${weapon.name}`;
      }
      log += ` for ${damage}hp!`;
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

  const armorClass = getArmorClass(target) || 0;

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

function getWeapon(entity: Entity) {
  const weaponId = entity.weaponSlot?.contents[0];
  if (weaponId) {
    return gameWorld.registry.get(weaponId);
  }
  return false;
}

function getAttack(entity: Entity) {
  const weapon = getWeapon(entity);
  let attack;
  if (weapon) {
    attack = sample(weapon.attacks);
  } else {
    attack = sample(entity.attacks);
  }

  return attack || false;
}

// TODO: take weapon as arg - weapon will have damage type, melee/ranged, finesse, and damage dice etc
function calcAttackDamage(attacker: Entity, attack: Attack) {
  let damage = new DiceRoll(attack.damageRoll).total;

  if (attack.attackType === "melee") {
    if (attack.useModifier && attacker.strength) {
      const mod = getModifier(attacker.strength);
      damage += mod;
    }
  }

  if (attack.attackType === "ranged") {
    if (attacker.dexterity) {
      const mod = getModifier(attacker.dexterity);
      damage += mod;
    }
  }

  return Math.max(0, damage);
}

function calcDamage(attacker: Entity, ranged: boolean) {
  let damage = 0;
  const weapon = getWeapon(attacker);

  if (weapon) {
    // if no damageRoll it's improvised
    const damageRoll = weapon.damageRoll || "1d4";

    const roll = new DiceRoll(damageRoll).total;
    damage += roll;

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

export function calcAverageDamage(entity: Entity, aWeapon?: Entity) {
  const weapon = aWeapon || getWeapon(entity);

  if (!entity.strength) return 0;

  const strengthMod = getModifier(entity.strength);

  // unarmed
  if (!weapon) return strengthMod + 1;

  // TODO: add things like proficiency and other bonuses
  // armed
  if (weapon) {
    // if no damageRoll, it's an improvised weapon
    const damageRoll = weapon.damageRoll || "1d4";
    const notation = `${damageRoll}+${strengthMod}`;
    return getAverageRoll(notation);
  }
}
