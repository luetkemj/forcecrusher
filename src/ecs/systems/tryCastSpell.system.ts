import { compact } from "lodash";
import { getState } from "../gameState";
import { getEAP } from "../../lib/utils";
import { IGameWorld } from "../engine";
import { castSpell } from "../../spells";

export const createTryCastSpellSystem = ({ world, registry }: IGameWorld) => {
  const tryCastSpellQuery = world
    .with("tryCastSpell")
    .without("excludeFromSim");

  return function tryCastSpellSystem() {
    for (const entity of tryCastSpellQuery) {
      const aoe = getState().spellAoe;

      const targetEids = aoe.flatMap((posId) =>
        Array.from(getEAP(posId) || []),
      );

      const targets = compact([...targetEids].map((eId) => registry.get(eId)));

      const { spellName } = entity.tryCastSpell;

      const spellContext = {
        caster: entity,
        targets,
      };

      // castSpell should be selected by user from a UI
      castSpell[spellName](spellContext);

      world.removeComponent(entity, "tryCastSpell");
    }
  };
};
