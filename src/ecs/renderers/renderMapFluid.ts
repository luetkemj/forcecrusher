import { MapView } from "../../lib/canvas";
import { Entity } from "../engine";
import { GameState, getState } from "../gameState";
import { RendererContext } from "../systems/render.system";

export const renderMapFluid = ({ views, world, queries }: RendererContext) => {
  const view = views.mapFluid;
  if (view) {
    view.clearView();

    const [player] = queries.pcQuery;
    if (player.excludeFromSim) {
      return;
    }

    const fluidContainerQuery = world.with("fluidContainer", "position");

    for (const entity of fluidContainerQuery) {
      const { x, y } = entity.position;

      // we only want to render fluidContainer entities, not all entities that happen to have one
      if (entity.name !== "fluidContainer") continue;

      if (entity.inFov) {
        renderCell(view, entity);
      }

      if (!entity.inFov && entity.revealed) {
        const { alpha } = getCellAlphas(entity);

        view?.updateCell({
          0: {
            char: "",
            tint: 0x134d8f,
            tileSet: "tile",
            x,
            y,
            alpha: Math.min(0.15, alpha),
          },
        });
      }

      if (
        getState().gameState.startsWith(GameState.MAKER_MODE) ||
        getState().cheats.seeAll
      ) {
        renderCell(view, entity);
      }
    }
  }
};

function getCellAlphas(entity: Entity) {
  const alphas = {
    lavaAlpha: 0,
    oilAlpha: 0,
    bloodAlpha: 0,
    waterAlpha: 0,
    alpha: 0,
  };

  if (!entity.fluidContainer) return alphas;

  const { lava, oil, blood, water } = entity.fluidContainer.fluids;
  const { maxVolume } = entity.fluidContainer;

  alphas.lavaAlpha = (lava.volume / maxVolume) * 10;
  alphas.oilAlpha = (oil.volume / maxVolume) * 10;
  alphas.bloodAlpha = (blood.volume / maxVolume) * 10;
  alphas.waterAlpha = (water.volume / maxVolume) * 10;
  alphas.alpha =
    alphas.lavaAlpha + alphas.oilAlpha + alphas.bloodAlpha + alphas.waterAlpha;

  return alphas;
}

function renderCell(view: MapView, entity: Entity) {
  if (!entity.position || !entity.fluidContainer) return;
  const { x, y } = entity.position;

  const { lava, oil, blood, water } = entity.fluidContainer.fluids;
  const { lavaAlpha, oilAlpha, waterAlpha, bloodAlpha } = getCellAlphas(entity);

  view?.updateCell({
    // lava
    0: {
      char: "",
      tint: lava.tint || 0xffffff,
      tileSet: "tile",
      x,
      y,
      alpha: lavaAlpha,
    },
    1: {
      char: "",
      tint: oil.tint || 0xffffff,
      tileSet: "tile",
      x,
      y,
      alpha: oilAlpha,
    },
    2: {
      char: "",
      tint: blood.tint || 0xffffff,
      tileSet: "tile",
      x,
      y,
      alpha: bloodAlpha,
    },
    3: {
      char: "",
      tint: water.tint || 0xffffff,
      tileSet: "tile",
      x,
      y,
      alpha: waterAlpha,
    },
  });
}
