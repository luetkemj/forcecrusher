import { type Entity } from "../ecs/engine";
import { addLog, d6, d20 } from "./utils";

export function meleeAttack(attacker: Entity, target: Entity) {
  let playerInCombat = false;
  if (attacker.pc || target.pc) {
    playerInCombat = true;
  }
  // roll attack
  const attackRoll = d20();

  const isCrit = attackRoll === 20;

  const { armorClass } = target;

  if (!armorClass || !target.health) return;

  if (attackRoll >= armorClass) {
    // NOTE: HIT
    let damage = calcDamage(attacker);
    if (isCrit) damage *= 2;

    target.health.current -= damage;

    if (playerInCombat) {
      let log = `${attacker.name} hits ${target.name} for ${damage} hp!`;
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
  const attackRoll = d20();

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

// TODO: take damage dice as arg
// TODO: take weapon as arg - weapon will have damage type, melee/ranged, finesse, and damage dice etc
function calcDamage(attacker: Entity, ranged: boolean) {
  let damage = d6();
  if (ranged) {
    if (attacker.dexterity) {
      damage += calcModifier(attacker.dexterity);
    }
  } else {
    if (attacker.strength) {
      damage += calcModifier(attacker.strength);
    }
  }

  return Math.max(0, damage);
}

function calcModifier(skill: number) {
  return Math.floor((skill - 10) / 2);
}
