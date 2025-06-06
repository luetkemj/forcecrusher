import { addLog } from "../../lib/utils";
import { gameWorld, type Entity, type Attack } from "../engine";
import { sample } from "lodash";
import { DiceRoll } from "@dice-roller/rpg-dice-roller";
import { getArmorClass } from "../../lib/combat";

const attackingEntities = gameWorld.world.with("attackTarget");

export const attackSystem = () => {
  for (const attacker of attackingEntities) {
    const target = attacker.attackTarget;

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

    gameWorld.world.removeComponent(attacker, "attackTarget");
  }
};

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
  } else {
    console.log("not a melee attack", attacker, attack);
  }

  return Math.max(0, damage);
}

const getModifier = (skill: number) => {
  return Math.floor((skill - 10) / 2);
};
