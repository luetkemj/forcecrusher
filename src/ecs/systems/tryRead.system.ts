import { remove } from "lodash";
import { addLog, logFrozenEntity } from "../../lib/utils";
import { spellLibrary } from "../../spells";
import { IGameWorld } from "../engine";

export const createTryReadSystem = ({ world, registry }: IGameWorld) => {
  const tryReadQuery = world.with("tryRead").without("excludeFromSim");

  return function tryReadSystem() {
    for (const actor of tryReadQuery) {
      const readerEntity = registry.get(actor.tryRead.readerId);
      if (!readerEntity) {
        logFrozenEntity(actor);
        console.log(`Cannot read ${actor.tryRead.readerId}`);
        continue;
      }

      // if spellbook
      if (actor.readable?.spellName) {
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
      } else {
        // readable item has no spell; treat as a simple reading action
        addLog(
          `${readerEntity.name} reads ${actor.name}: ${actor.readable?.message}.`,
        );
        world.removeComponent(actor, "tryRead");
      }
    }
  };
};
