import { addLog } from "../../lib/utils";
import { gameWorld, type Entity, type Attack, type Damage } from "../engine";
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
      let damages = calcAttackDamage(attacker, attack, target, isCrit, weapon);

      if (target.damages) {
        target.damages.push(...damages);
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

function getWeapon(entity: Entity) {
  const weaponId = entity.weaponSlot?.contents[0];
  if (weaponId) {
    return gameWorld.registry.get(weaponId);
  }
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

function calcAttackDamage(
  attacker: Entity,
  attack: Attack,
  target: Entity,
  isCrit: boolean,
  weapon?: Entity,
) {
  let amount = new DiceRoll(attack.damageRoll).total;
  let mod = 0;

  if (attack.attackType === "melee") {
    if (attack.useModifier && attacker.strength) {
      mod = getModifier(attacker.strength);
    }
  } else {
    console.log("not a melee attack", attacker, attack);
  }

  const damage: Damage = {
    attacker: attacker.id,
    attack,
    target: target.id,
    critical: isCrit,
    weapon: weapon?.id,
    damageAmounts: [
      { type: attack.damageType, amount: Math.max(0, amount), mod },
    ],
  };

  return [damage];
}

const getModifier = (skill: number) => {
  return Math.floor((skill - 10) / 2);
};
