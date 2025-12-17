import { random } from "lodash";
import { addLog, colorEntity, getWearing } from "../../lib/utils";
import { Entity, IGameWorld } from "../engine";
import { DamageType } from "../enums";

export const createDamageSystem = ({ world, registry }: IGameWorld) => {
  const damageQuery = world.with("damages").without("excludeFromSim");

  return function damageSystem() {
    for (const target of damageQuery) {
      for (const damage of target.damages) {
        const attacker = damage.attacker ? registry.get(damage.attacker) : null;
        const instigator = damage.instigator
          ? registry.get(damage.instigator)
          : null;
        const responder = damage.responder
          ? registry.get(damage.responder)
          : null;
        const attack = damage.attack;
        const weapon = damage.weapon ? registry.get(damage.weapon) : null;

        // actually process the damage
        let totalDamage = 0;

        // flags for logging
        let vulnerable = false;
        let resistant = false;
        let immune = false;

        for (const damageAmount of damage.damageAmounts) {
          let computedDamage = damageAmount.amount;

          const vulnerabilities = new Set<DamageType>();
          const resistances = new Set<DamageType>();
          const immunities = new Set<DamageType>();

          const armor = getWearing(target);

          if (armor?.vulnerabilities)
            armor.vulnerabilities.forEach((v) => vulnerabilities.add(v));
          if (target.vulnerabilities)
            target.vulnerabilities.forEach((v) => vulnerabilities.add(v));

          if (armor?.resistances)
            armor.resistances.forEach((r) => resistances.add(r));
          if (target.resistances)
            target.resistances.forEach((r) => resistances.add(r));

          if (armor?.immunities)
            armor.immunities.forEach((i) => immunities.add(i));
          if (target.immunities)
            target.immunities.forEach((i) => immunities.add(i));

          if (vulnerabilities.has(damageAmount.type)) {
            vulnerable = true;
            computedDamage *= 2;
          }
          if (resistances.has(damageAmount.type)) {
            resistant = true;
            computedDamage = Math.floor(computedDamage / 2);
          }
          if (immunities.has(damageAmount.type)) {
            immune = true;
            computedDamage = 0;
          }

          if (damage.critical) {
            computedDamage *= 2;
          }

          const damageReduction = getDamageReduction(armor);

          computedDamage += damageAmount.mod;
          totalDamage += computedDamage;
          totalDamage -= damageReduction;
        }

        if (totalDamage < 0) totalDamage = 0;

        if (target.health) {
          target.health.current -= totalDamage;
        }

        // Log output
        const pcInvolved = attacker?.pc || instigator?.pc || target.pc;

        if (pcInvolved) {
          let logParts: string[] = [];

          // Environmental damage
          if (!attacker && instigator === target) {
            // e.g. kicked a wall and hurt yourself
            logParts.push(`§red§You hurt yourself`);
            if (responder) {
              logParts.push(`on the ${colorEntity(responder)}§red§`);
            }
            if (damage.reason) logParts.push(`(${damage.reason})`);
          }

          // Passive responder (e.g., trap, door)
          else if (!attacker && instigator && responder) {
            logParts.push(
              `${colorEntity(instigator)}§red§ was hurt by ${colorEntity(responder)}§red§`,
            );
            if (damage.reason) logParts.push(`(${damage.reason})`);
          }

          // Normal attack (entity vs entity)
          else if (attacker && attack) {
            let colorTag = attacker.pc ? "§purple§" : "§red§";
            logParts.push(
              `${colorEntity(attacker)}${colorTag} ${attack.verb} ${colorEntity(target)}${colorTag}`,
            );
            if (weapon) {
              logParts.push(`with ${colorEntity(weapon)}${colorTag}`);
            }
          }

          if (target.dead) {
            logParts.push("but it's already dead.");
          } else {
            // Damage summary
            logParts.push(`for ${totalDamage}hp!`);
            if (vulnerable) logParts.unshift(`Vulnerable!`);
            if (resistant) logParts.unshift(`Resistant!`);
            if (immune) logParts.unshift(`Immune!`);
            if (damage.critical) logParts.unshift(`Critical!`);
          }

          addLog(logParts.join(" "));
        }
      }

      // clear damage
      target.damages = [];
    }
  };
};

function getDamageReduction(armor?: Entity): number {
  if (!armor) return 0;
  if (!armor.damageReduction) return 0;

  const { min, max } = armor.damageReduction;
  return random(min, max);
}
