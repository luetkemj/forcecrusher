import { addLog } from "../../lib/utils";
import { IGameWorld } from "../engine";

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

        for (const damageAmount of damage.damageAmounts) {
          computedDamage = damageAmount.amount;

          // TODO: get armor resistances etc
          if (target.vulnerabilities?.includes(damageAmount.type)) {
            computedDamage = computedDamage * 2;
          }
          if (target.resistances?.includes(damageAmount.type)) {
            computedDamage = Math.floor(computedDamage / 2);
          }
          if (target.immunities?.includes(damageAmount.type)) {
            computedDamage = 0;
          }

          if (damage.critical) {
            computedDamage = computedDamage * 2;
          }

          computedDamage += damageAmount.mod;

          if (target.health) {
            target.health.current -= computedDamage;
          }
        }

        // only log if player is in on the attack
        if (attacker.pc || target.pc) {
          let log = `${attacker.name} ${attack.verb} ${target.name}`;
          if (weapon) {
            log += ` with ${weapon.name}`;
          }
          log += ` for ${computedDamage}hp!`;
          if (damage.critical) log = `Critical! ${log}`;
          addLog(log);
        }
      }

      target.damages = [];
    }
  };
};
