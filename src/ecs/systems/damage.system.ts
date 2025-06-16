import { addLog, getWearing } from "../../lib/utils";
import { IGameWorld } from "../engine";
import { DamageType } from "../enums";

export const createDamageSystem = (
  world: IGameWorld["world"],
  registry: IGameWorld["registry"],
) => {
  const damageQuery = world.with("damages");

  return function system() {
    for (const target of damageQuery) {
      for (const damage of target.damages) {
        const attacker = registry.get(damage.attacker);
        const attack = damage.attack;
        let weapon;
        if (damage.weapon) {
          weapon = registry.get(damage.weapon);
        }

        if (!attacker) {
          console.log("no attacker");
          return;
        }

        // actually process the damage
        let computedDamage = 0;

        // flags
        let vulnerable = false;
        let resistant = false;
        let immune = false;

        for (const damageAmount of damage.damageAmounts) {
          computedDamage = damageAmount.amount;

          // TODO: get armor resistances etc

          const vulnerabilities = new Set();
          const resistances = new Set();
          const immunities = new Set();

          const armor = getWearing(target);

          // collate vulnerability
          if (armor && armor.vulnerabilities) {
            armor.vulnerabilities.forEach((v: DamageType) =>
              vulnerabilities.add(v),
            );
          }
          if (target.vulnerabilities) {
            target.vulnerabilities.forEach((v: DamageType) =>
              vulnerabilities.add(v),
            );
          }

          // collate resistances
          if (armor && armor.resistances) {
            armor.resistances.forEach((r: DamageType) => resistances.add(r));
          }
          if (target.resistances) {
            target.resistances.forEach((r: DamageType) => resistances.add(r));
          }

          // collate immunities
          if (armor && armor.immunities) {
            armor.immunities.forEach((i: DamageType) => immunities.add(i));
          }
          if (target.immunities) {
            target.immunities.forEach((i: DamageType) => immunities.add(i));
          }

          // add to computedDamage
          if (vulnerabilities.has(damageAmount.type)) {
            vulnerable = true;
            computedDamage = computedDamage * 2;
          }
          if (resistances.has(damageAmount.type)) {
            resistant = true;
            computedDamage = Math.floor(computedDamage / 2);
          }
          if (immunities.has(damageAmount.type)) {
            immune = true;
            computedDamage = 0;
          }

          // double if critical
          if (damage.critical) {
            computedDamage = computedDamage * 2;
          }

          // add damage mod
          computedDamage += damageAmount.mod;

          // reduce target health
          if (target.health) {
            target.health.current -= computedDamage;
          }
        }

        // only log if player is in on the attack
        if (attacker.pc || target.pc) {
          let log = attacker.pc ? '§purple§' : '§red§'; 
          log += `${attacker.name} ${attack.verb} ${target.name}`;
          if (weapon) {
            log += ` with ${weapon.name}`;
          }
          log += ` for ${computedDamage}hp!`;
          if (vulnerable) log = `Vulnerable! ${log}`;
          if (resistant) log = `Resistant! ${log}`;
          if (immune) log = `Immune! ${log}`;
          if (damage.critical) log = `Critical! ${log}`;
          addLog(log);
        }
      }

      // reset target damages
      target.damages = [];
    }
  };
};
