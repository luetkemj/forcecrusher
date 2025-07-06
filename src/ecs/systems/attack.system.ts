import {
  type IGameWorld,
  type Entity,
  type Attack,
  type Damage,
} from "../engine";
import { sample } from "lodash";
import { DiceRoll } from "@dice-roller/rpg-dice-roller";

export const createAttackSystem = ({ world, registry }: IGameWorld) => {
  const attackQuery = world.with("tryAttack");

  const cleanUp = (actor: Entity) => {
    world.removeComponent(actor, "tryAttack");
  };

  return function attackSystem() {
    for (const actor of attackQuery) {
      const target = registry.get(actor.tryAttack.targetId);
      const attack = actor.tryAttack.attack || getAttack(actor, registry);
      const weapon =
        attack && attack.natural ? undefined : getWeapon(actor, registry);

      if (!target) {
        console.log(`${actor.name} has no target`);
        return cleanUp(actor);
      }

      // baddies only attack PC
      if (!actor.pc && !target.pc) {
        return cleanUp(actor);
      }

      let playerInCombat = false;
      if (actor.pc || target?.pc) {
        playerInCombat = true;
      }

      if (!attack) {
        console.log(`${actor.name} has no means of attack`);
        return cleanUp(actor);
      }

      // roll attack
      // TODO: should this have any toHit bonuses?
      const isCrit = Math.random() < 0.05; // 5% or 1 on a d20

      // NOTE: HIT
      let damages = calcAttackDamage(actor, attack, target, isCrit, weapon);

      if (target.damages) {
        target.damages.push(...damages);
      }

      if (attack.knockbackDistance) {
        world.addComponent(target, "knockback", {
          actorId: actor.id,
          targetId: target.id,
          distance: attack.knockbackDistance,
        });
      }

      cleanUp(actor);
    }
  };
};

function getWeapon(entity: Entity, registry: IGameWorld["registry"]) {
  const weaponId = entity.weaponSlot?.contents[0];
  if (weaponId) {
    return registry.get(weaponId);
  }
}

function getAttack(actor: Entity, registry: IGameWorld["registry"]) {
  const weapon = getWeapon(actor, registry);
  let attack;
  if (weapon) {
    attack = sample(weapon.attacks);
  } else {
    attack = sample(actor.attacks);
  }

  return attack || false;
}

function calcAttackDamage(
  actor: Entity,
  attack: Attack,
  target: Entity,
  isCrit: boolean,
  weapon?: Entity,
) {
  let amount = new DiceRoll(attack.damageRoll).total;
  let mod = 0;

  if (attack.attackType === "melee") {
    if (attack.useModifier && actor.strength) {
      mod = getModifier(actor.strength);
    }
  } else {
    console.log("not a melee attack", actor, attack);
  }

  const damage: Damage = {
    attacker: actor.id,
    instigator: actor.id,
    responder: target.id,
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
