import { spellLibrary } from "../../spells";
import { TileSet } from "../enums";
import { GameState, getState } from "../gameState";
import { RendererContext } from "../systems/render.system";

export const renderMapSpellEffects = ({
  views,
  world,
  queries,
}: RendererContext) => {
  const view = views.spellEffectsMap;
  if (view) {
    view.clearView();

    const [player] = queries.pcQuery;
    if (player.excludeFromSim) {
      return;
    }

    const spellBoundQuery = world.with("spellbound", "position");

    for (const entity of spellBoundQuery) {
      const { x, y } = entity.position;

      const spell = spellLibrary[entity.spellbound.spellName];

      const cell = {
        char: spell.appearance?.char || "",
        tint: spell.appearance?.tint || 0xffffff,
        tileSet: TileSet.Kenny,
        x,
        y,
        alpha: 0.5,
      };

      if (entity.inFov) {
        view?.updateCell({
          0: cell,
        });
      }

      if (
        getState().gameState.startsWith(GameState.MAKER_MODE) ||
        getState().cheats.seeAll
      ) {
        view?.updateCell({
          0: cell,
        });
      }
    }
  }
};
