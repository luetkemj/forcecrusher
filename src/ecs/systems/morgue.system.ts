import { Entity, IGameWorld } from "../engine";
import { setState, State, GameState } from "../gameState";
import { addLog, colorTag, writeToLeaderboard } from "../../lib/utils";
import { capitalize } from "lodash";
import { AttackType } from "../enums";

export const createMorgueSystem = ({ world, registry }: IGameWorld) => {
  const livingQuery = world
    .with("health")
    .without("dead", "destroyed", "excludeFromSim");

  return function morgueSystem() {
    for (const entity of livingQuery) {
      if (entity.health.current <= 0) {
        if (entity.appearance) {
          if (entity.appearanceCorpse) {
            entity.appearance = { ...entity.appearanceCorpse };
          } else {
            entity.appearance.char = "corpse";
          }
        }

        // NOTE: leads to unbalance and way to many item in game.
        // removing for now - possibly forever
        //
        // unWield(entity);
        // unWear(entity);
        //
        // // drop inventory
        // if (entity.container?.contents) {
        //   for (const eId of entity.container.contents) {
        //     const item = registry.get(eId);
        //     if (item) {
        //       world.addComponent(item, "tryDrop", { dropperId: entity.id });
        //     }
        //   }
        // }

        const entityTint = entity.appearance?.tint || 0x00ff00;

        if (entity.living) {
          world.removeComponent(entity, "living");
          world.addComponent(entity, "dead", true);
          addLog(`${colorTag(entityTint)}${entity.name}§purple§ has died!`);
        } else if (!entity.indestructible) {
          world.addComponent(entity, "destroyed", true);
          addLog(
            `${colorTag(entityTint)}${entity.name}§purple§ has been destroyed!`,
          );
        }

        world.removeComponent(entity, "ai");
        world.removeComponent(entity, "blocking");
        world.removeComponent(entity, "opaque");
        world.removeComponent(entity, "layer300");
        world.removeComponent(entity, "openable");
        world.removeComponent(entity, "legendable");

        world.addComponent(entity, "pickUp", true);
        world.addComponent(entity, "layer200", true);

        if (entity.fluidContainer) {
          world.removeComponent(entity, "desiccate");
          entity.fluidContainer.corked = false;
        }

        if (entity.pc) {
          const cod = getPCCauseOfDeath(entity, registry) || "Unknown?";

          setState((state: State) => {
            state.gameState = GameState.GAME_OVER;
            state.morgue.causeOfDeath = cod;
          });

          void writeToLeaderboard(entity, cod, false);
        }
      }
    }
  };
};

const getPCCauseOfDeath = (entity: Entity, registry: Map<string, Entity>) => {
  if (!entity.cod) return;

  let cod = ``;

  const { attack, reason } = entity.cod;

  const attacker = registry.get(entity.cod.attacker || "");
  const instigator = registry.get(entity.cod.instigator || "");
  const responder = registry.get(entity.cod.responder || "");
  const target = registry.get(entity.cod.target || "");
  const weapon = registry.get(entity.cod.weapon || "");

  // if null, is environment
  if (attacker) {
    if (attack) {
      if (
        attack.attackType === AttackType.MeleeSpell ||
        attack.attackType === AttackType.RangedSpell
      ) {
        cod += `${capitalize(attack.verbPastTense)} ${attack.name} `;
      } else {
        cod += `${capitalize(attack.verbPastTense)} to death `;
      }
    } else {
      cod += `Killed `;
    }

    if (!attacker) {
      cod += "by environment ";
    } else if (attacker.pc) {
      cod += "on self";
    } else {
      cod += `by ${attacker.name} `;
    }

    if (weapon) {
      cod += `with a ${weapon.name}`;
    }
    // who initiated the action (who kicked the door)
  } else if (instigator) {
    if (instigator.pc) {
      cod += `${capitalize(reason)} `;

      if (responder) {
        cod += `${responder.name} `;
      }

      cod += `to death`;
    }
    // what was interacted with (the door)
  } else if (responder) {
    // who took the damage
  } else if (target) {
  }

  console.log(entity.cod);

  return cod.trim();
};
