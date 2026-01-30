import { sample } from "lodash";
import { spawn } from "../actors";
import { type Pos } from "../lib/grid";
import { SpellName } from "../ecs/enums";
import { spellLibrary } from "../spells";

export const spawnSpellbook = (position: Pos) => {
  const spellbook = spawn("spellbook", { position });

  const spellName = sample(Object.values(SpellName));

  if (spellName && spellbook.readable && spellbook.appearance) {
    const spell = spellLibrary[spellName];
    if (spell && spell.appearance) {
      spellbook.readable.message = `You have learned ${spell.displayName}!`;
      spellbook.readable.spellName = spellName;
      spellbook.appearance.tint = spell.appearance.tint;
    }
  }

  return spellbook;
};
