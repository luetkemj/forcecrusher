import { dispelLibrary } from "../../spells";
import { IGameWorld } from "../engine";
import { getState } from "../gameState";

export const createUncastSpellSystem = ({ world }: IGameWorld) => {
  const spellboundQuery = world.with("spellbound").without("excludeFromSim");

  return function uncastSpellSystem() {
    const { turnNumber } = getState();
    for (const actor of spellboundQuery) {
      if (turnNumber >= actor.spellbound.turnNumber) {
        if (actor.spellbound.dispel) {
          const func = dispelLibrary[actor.spellbound.dispel];
          if (func) {
            func(world, actor);
          }
        }

        world.removeComponent(actor, "spellbound");
      }
    }
  };
};
