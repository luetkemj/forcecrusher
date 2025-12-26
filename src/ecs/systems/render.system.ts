import { Query, With, World } from "miniplex";
import { IGameWorld, Entity } from "../engine";
import { getState, Views } from "../gameState";
import { MapView } from "../../lib/canvas";
import { renderLegend } from "../renderers/renderLegend";
import { renderMap } from "../renderers/renderMap";
import { renderMapFire } from "../renderers/renderMapFire";
import { renderMapFluid } from "../renderers/renderMapFluid";
import { renderOdorMap } from "../renderers/renderOdorMap";
import { renderVisionMap } from "../renderers/renderVisionMap";
import { renderSenses } from "../renderers/renderSenses";
import { renderMenuUnderlay } from "../renderers/renderMenuUnderlay";
import { renderLogHistory } from "../renderers/renderLogHistory";
import { renderInventory } from "../renderers/renderInventory";
import { renderLog } from "../renderers/renderLog";
import { renderCursor } from "../renderers/renderCursor";
import { renderHud } from "../renderers/renderHud";
import { renderControls } from "../renderers/renderControls";
import { renderMakerMode } from "../renderers/renderMakerMode";
import { renderSoundMap } from "../renderers/renderSoundMap";
import { renderSaving } from "../renderers/renderSaving";
import { renderLoading } from "../renderers/renderLoading";

export interface RendererContext {
  world: World<Entity>;
  views: Views;
  queries: {
    renderable100Query: Query<
      With<Entity, "position" | "appearance" | "layer100">
    >;
    renderable125Query: Query<
      With<Entity, "position" | "appearance" | "layer125">
    >;
    renderable150Query: Query<
      With<Entity, "position" | "appearance" | "layer150">
    >;
    renderable200Query: Query<
      With<Entity, "position" | "appearance" | "layer200">
    >;
    renderable225Query: Query<
      With<Entity, "position" | "appearance" | "layer225">
    >;
    renderable250Query: Query<
      With<Entity, "position" | "appearance" | "layer250">
    >;
    renderable300Query: Query<
      With<Entity, "position" | "appearance" | "layer300">
    >;
    renderable325Query: Query<
      With<Entity, "position" | "appearance" | "layer325">
    >;
    renderable350Query: Query<
      With<Entity, "position" | "appearance" | "layer350">
    >;
    renderable400Query: Query<
      With<Entity, "position" | "appearance" | "layer400">
    >;

    pcQuery: Query<With<Entity, "position" | "pc">>;
    inFovQuery: Query<
      With<Entity, "inFov" | "legendable" | "position" | "appearance" | "name">
    >;
  };
  registry: IGameWorld["registry"];
}

export const createRenderSystem = ({ world, registry }: IGameWorld) => {
  const renderable100Query = world.with("position", "appearance", "layer100");
  const renderable125Query = world.with("position", "appearance", "layer125");
  const renderable150Query = world.with("position", "appearance", "layer150");
  const renderable200Query = world.with("position", "appearance", "layer200");
  const renderable225Query = world.with("position", "appearance", "layer225");
  const renderable250Query = world.with("position", "appearance", "layer250");
  const renderable300Query = world.with("position", "appearance", "layer300");
  const renderable325Query = world.with("position", "appearance", "layer325");
  const renderable350Query = world.with("position", "appearance", "layer350");
  const renderable400Query = world.with("position", "appearance", "layer400");
  // for rendering the legend
  const inFovQuery = world.with(
    "inFov",
    "legendable",
    "position",
    "appearance",
    "name",
  );
  const pcQuery = world.with("pc", "position");

  const ctx = {
    world,
    views: getState().views,
    queries: {
      renderable100Query,
      renderable125Query,
      renderable150Query,
      renderable200Query,
      renderable225Query,
      renderable250Query,
      renderable300Query,
      renderable325Query,
      renderable350Query,
      renderable400Query,
      inFovQuery,
      pcQuery,
    },
    registry,
  };

  return function renderSystem() {
    renderMap(ctx);
    renderMapFire(ctx);
    renderMapFluid(ctx);
    renderOdorMap(ctx);
    renderSoundMap(ctx);
    renderVisionMap(ctx);
    renderSenses(ctx);
    renderLegend(ctx);
    renderMenuUnderlay(ctx);
    renderLogHistory(ctx);
    renderInventory(ctx);
    renderLog(ctx);
    renderCursor(ctx);
    renderHud(ctx);
    renderControls(ctx);
    renderMakerMode(ctx);
    renderSaving(ctx);
    renderLoading(ctx);
  };
};

// NOTE:
// this in now a NOOP
// TODO: update this to remove colorTags
// the width calculation includes color tags (which aren't rendered)
// NOTE: can probably parse the tags, then do this,
// Or possible now because now we have cursor based rendering, not cell based.
export const concatRow = (str: string, length: number): string => {
  let newStr = str;
  if (newStr.length > length) {
    const trimLength = newStr.length - (length - 3);
    newStr = newStr
      .substring(0, newStr.length - trimLength)
      .trim()
      .concat("...");
  }
  return str;
};

// create a gradiant across rows
export const getAlpha = (index: number) => {
  if (index < 4) {
    return (100 - (5 - index) * 7) / 100;
  }

  return 1;
};

export const renderEntity = (
  view: MapView,
  entity: Entity,
  alpha: number,
  tintOverride: number,
) => {
  const { appearance, position } = entity;
  if (!appearance || !position) return;

  const { char, tint, tileSet } = appearance;
  const { x, y } = position;

  view?.updateCell({
    0: { char, tint: 0x000000, alpha: 0, tileSet: "tile", x, y },
    1: { char, tint: tintOverride || tint, alpha, tileSet, x, y },
  });
};
