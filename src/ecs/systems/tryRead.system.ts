import { remove } from "lodash";
import {
  addLog,
  generateAncientTongue,
  logFrozenEntity,
} from "../../lib/utils";
import { spellLibrary } from "../../spells";
import { IGameWorld } from "../engine";
import { ReadableType } from "../enums";

export const createTryReadSystem = ({ world, registry }: IGameWorld) => {
  const tryReadQuery = world.with("tryRead").without("excludeFromSim");

  return function tryReadSystem() {
    for (const actor of tryReadQuery) {
      if (!actor.readable) {
        logFrozenEntity(actor);
        console.log(`${actor} is not readable`);
        continue;
      }

      const readerEntity = registry.get(actor.tryRead.readerId);
      if (!readerEntity) {
        logFrozenEntity(actor);
        console.log(`Cannot read ${actor.tryRead.readerId} does not exist`);
        continue;
      }

      // if spellbook
      if (
        actor.readable.type === ReadableType.Spellbook &&
        actor.readable.spellName
      ) {
        // if reader has knownSpells component
        if (readerEntity.knownSpells) {
          const { spellName } = actor.readable;
          // if reader already knows the spell
          if (
            readerEntity.knownSpells.find((spell) => spell.name === spellName)
          ) {
            addLog(`${readerEntity.name} already knows ${spellName}`);
            // remove tryRead from book
            world.removeComponent(actor, "tryRead");
            // If reader doesn't know the spell
          } else {
            // learn spell
            readerEntity.knownSpells.push(spellLibrary[spellName]);
            // TODO: stored the ancient tongue somewhere so it can be associated with the spell for the playthrough
            // duplicate books can reference the string and you can read it in english in your inventory
            // Spellbook: "Inferno" - maybe we don't need the ancient language? It's not read aloud again or anything
            // but would be nice to change the book title to one you already know.
            const ancientTongue = generateAncientTongue();
            addLog(`${readerEntity.name} reads aloud: "${ancientTongue}"`);
            addLog(`${readerEntity.name} has learned ${spellName}!`);
            // remove book from inventory
            if (readerEntity.container) {
              remove(readerEntity.container.contents, (id) => actor.id === id);
            }
            // remove book from gameWorld
            world.remove(actor);
          }
        } else {
          // reader cannot learn spells; finish the read attempt
          addLog(`${readerEntity.name} cannot make sense of ${actor.name}.`);
          world.removeComponent(actor, "tryRead");
        }
      } else if (actor.readable.type === ReadableType.Scroll) {
        addLog(
          `${readerEntity.name} reads ${actor.name}: "${actor.readable?.message}."`,
        );
        world.removeComponent(actor, "tryRead");
      } else if (actor.readable.type === ReadableType.Text) {
        addLog(
          `${readerEntity.name} reads ${actor.name}: "${actor.readable?.message}."`,
        );
        world.removeComponent(actor, "tryRead");
      } else {
        logFrozenEntity(actor);
        console.log(
          `${actor.readable.type}: readable type is not recognized and cannot be read`,
        );
        world.removeComponent(actor, "tryRead");
      }
    }
  };
};
