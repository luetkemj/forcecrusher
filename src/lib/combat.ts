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

function calcDamage(attacker: Entity) {
  let damage = d6();
  if (attacker.strength) {
    damage += calcModifier(attacker.strength);
  }
  return Math.max(0, damage);
}

function calcModifier(skill: number) {
  return Math.floor((skill - 10) / 2);
}
