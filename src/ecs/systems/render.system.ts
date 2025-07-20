import { Query, With } from "miniplex";
import { IGameWorld, Entity } from "../engine";
import { getState, Views } from "../gameState";
import { View } from "../../lib/canvas";
import { renderLegend } from "../renderers/renderLegend";
import { renderMap } from "../renderers/renderMap";
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

export interface RendererContext {
  views: Views;
  queries: {
    renderable100Query: Query<
      With<Entity, "position" | "appearance" | "layer100">
    >;
    renderable200Query: Query<
      With<Entity, "position" | "appearance" | "layer200">
    >;
    renderable300Query: Query<
      With<Entity, "position" | "appearance" | "layer300">
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
  const renderable200Query = world.with("position", "appearance", "layer200");
  const renderable300Query = world.with("position", "appearance", "layer300");
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
    views: getState().views,
    queries: {
      renderable100Query,
      renderable200Query,
      renderable300Query,
      renderable400Query,
      inFovQuery,
      pcQuery,
    },
    registry,
  };

  return function renderSystem() {
    renderMap(ctx);
    renderOdorMap(ctx);
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
  };
};

// NOTE:
// this in now a NOOP
// TODO: update this to remove colorTags
// the width calculation includes color tags (which aren't rendered)
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

export const renderEntity = (view: View, entity: Entity, alpha: number) => {
  const { appearance, position } = entity;
  if (!appearance || !position) return;

  const { char, tint, tileSet } = appearance;
  const { x, y } = position;

  view?.updateCell({
    0: { char, tint: 0x000000, alpha: 0, tileSet: "tile", x, y },
    1: { char, tint, alpha, tileSet, x, y },
  });
};
