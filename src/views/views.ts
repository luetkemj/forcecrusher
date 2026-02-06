import { TileSet } from "../ecs/enums";
import { Views } from "../ecs/gameState";
import { MapView, UIPanelView } from "../lib/canvas";

/* ============================================================================
 * View IDs
 * ============================================================================
 */

export type ViewId =
  | "legend"
  | "log"
  | "senses"
  | "map"
  | "targeting"
  | "mapFire"
  | "mapFluid"
  | "odorMap"
  | "soundMap"
  | "visionMap"
  | "fps"
  | "gitTag"
  | "hud"
  | "controls"
  | "menuUnderlay"
  | "inventory"
  | "logHistory"
  | "makerModeRight"
  | "makerModeLeft"
  | "makerModeTop"
  | "saving"
  | "spellbook"
  | "loading";

/* ============================================================================
 * View Config Types
 * ============================================================================
 */

type ViewKind = "map" | "ui";

type BaseViewConfig = ConstructorParameters<typeof MapView>[0];

interface ViewConfig extends BaseViewConfig {
  kind: ViewKind;
}

/* ============================================================================
 * View Configs
 * ============================================================================
 */

export const viewConfigs: Record<ViewId, ViewConfig> = {
  legend: {
    kind: "ui",
    width: 25,
    height: 44,
    x: 0,
    y: 0,
    layers: 1,
    tileSets: [TileSet.Text],
    tints: [0xff0077],
    alphas: [1],
    visible: true,
    name: "legend",
  },

  log: {
    kind: "ui",
    width: 74,
    height: 5,
    x: 13,
    y: 0,
    layers: 1,
    tileSets: [TileSet.Text],
    tints: [0xeeeeee],
    alphas: [1],
    visible: true,
    name: "log",
  },

  senses: {
    kind: "ui",
    width: 74,
    height: 5,
    x: 50,
    y: 0,
    layers: 1,
    tileSets: [TileSet.Text],
    tints: [0xeeeeee],
    alphas: [1],
    visible: true,
    name: "senses",
  },

  mapFluid: {
    kind: "map",
    width: 74,
    height: 39,
    x: 13,
    y: 5,
    layers: 4,
    tileSets: [TileSet.Kenny],
    tints: [0x000000, 0x000000, 0x000000, 0x000000],
    alphas: [0, 0, 0, 0],
    visible: true,
    name: "mapFluid",
  },

  map: {
    kind: "map",
    width: 74,
    height: 39,
    x: 13,
    y: 5,
    layers: 3,
    tileSets: [TileSet.Tile, TileSet.Ascii, TileSet.Tile],
    tints: [0x000000, 0x000000, 0x000000],
    alphas: [1, 1, 0],
    visible: true,
    name: "map",
  },

  targeting: {
    kind: "map",
    width: 74,
    height: 39,
    x: 13,
    y: 5,
    layers: 2,
    tileSets: [TileSet.Tile, TileSet.Kenny],
    tints: [0x00ff77, 0x000000],
    alphas: [1, 0],
    visible: false,
    name: "targeting",
  },

  mapFire: {
    kind: "map",
    width: 74,
    height: 39,
    x: 13,
    y: 5,
    layers: 1,
    tileSets: [TileSet.Kenny],
    tints: [0x000000],
    alphas: [1],
    visible: true,
    name: "mapFire",
  },

  odorMap: {
    kind: "map",
    width: 74,
    height: 39,
    x: 13,
    y: 5,
    layers: 1,
    tileSets: [TileSet.Tile],
    tints: [0x000000],
    alphas: [1],
    visible: true,
    name: "odorMap",
  },

  soundMap: {
    kind: "map",
    width: 74,
    height: 39,
    x: 13,
    y: 5,
    layers: 1,
    tileSets: [TileSet.Tile],
    tints: [0x000000],
    alphas: [1],
    visible: true,
    name: "soundMap",
  },

  visionMap: {
    kind: "map",
    width: 74,
    height: 39,
    x: 13,
    y: 5,
    layers: 1,
    tileSets: [TileSet.Tile],
    tints: [0x000000],
    alphas: [1],
    visible: true,
    name: "visionMap",
  },

  fps: {
    kind: "ui",
    width: 12,
    height: 1,
    x: 0,
    y: 44,
    layers: 1,
    tileSets: [TileSet.Text],
    tints: [0x333333],
    alphas: [1],
    visible: true,
    name: "fps",
  },

  gitTag: {
    kind: "ui",
    width: 12,
    height: 1,
    x: 0,
    y: 45,
    layers: 1,
    tileSets: [TileSet.Text],
    tints: [0x333333],
    alphas: [1],
    visible: true,
    name: "gitTag",
  },

  hud: {
    kind: "ui",
    width: 26,
    height: 46,
    x: 87,
    y: 0,
    layers: 1,
    tileSets: [TileSet.Text],
    tints: [0xdddddd],
    alphas: [1],
    visible: true,
    name: "hud",
  },

  controls: {
    kind: "ui",
    width: 148,
    height: 2,
    x: 13,
    y: 44,
    layers: 1,
    tileSets: [TileSet.Text],
    tints: [0x999999],
    alphas: [1],
    visible: true,
    name: "controls",
  },

  menuUnderlay: {
    kind: "map",
    width: 100,
    height: 44,
    x: 0,
    y: 0,
    layers: 1,
    tileSets: [TileSet.Tile],
    tints: [0x111111],
    alphas: [0.75],
    visible: false,
    name: "menuUnderlay",
  },

  inventory: {
    kind: "ui",
    width: 148,
    height: 39,
    x: 13,
    y: 5,
    layers: 1,
    tileSets: [TileSet.Text],
    tints: [0xffffff],
    alphas: [1],
    visible: false,
    name: "inventory",
  },

  spellbook: {
    kind: "ui",
    width: 148,
    height: 39,
    x: 13,
    y: 5,
    layers: 1,
    tileSets: [TileSet.Text],
    tints: [0xffffff],
    alphas: [1],
    visible: false,
    name: "spellbook",
  },

  logHistory: {
    kind: "ui",
    width: 148,
    height: 44,
    x: 13,
    y: 0,
    layers: 1,
    tileSets: [TileSet.Text],
    tints: [0xffffff],
    alphas: [1],
    visible: false,
    name: "logHistory",
  },

  makerModeRight: {
    kind: "ui",
    width: 26,
    height: 46,
    x: 87,
    y: 0,
    layers: 2,
    tileSets: [TileSet.Tile, TileSet.Text],
    tints: [0x000000, 0xdddddd],
    alphas: [1, 1],
    visible: false,
    name: "makerModeRight",
  },

  makerModeLeft: {
    kind: "ui",
    width: 25,
    height: 44,
    x: 0,
    y: 0,
    layers: 2,
    tileSets: [TileSet.Tile, TileSet.Text],
    tints: [0x000000, 0xdddddd],
    alphas: [1, 1],
    visible: false,
    name: "makerModeLeft",
  },

  makerModeTop: {
    kind: "ui",
    width: 148,
    height: 5,
    x: 13,
    y: 0,
    layers: 2,
    tileSets: [TileSet.Tile, TileSet.Text],
    tints: [0x000000, 0xeeeeee],
    alphas: [1, 1],
    visible: false,
    name: "makerModeTop",
  },

  saving: {
    kind: "ui",
    width: 148,
    height: 39,
    x: 13,
    y: 5,
    layers: 2,
    tileSets: [TileSet.Text, TileSet.Text],
    tints: [0x111111, 0xffffff],
    alphas: [1],
    visible: false,
    name: "saving",
  },

  loading: {
    kind: "ui",
    width: 148,
    height: 39,
    x: 13,
    y: 5,
    layers: 1,
    tileSets: [TileSet.Text],
    tints: [0xffffff],
    alphas: [1],
    visible: false,
    name: "loading",
  },
};

/* ============================================================================
 * View Creation
 * ============================================================================
 */

export function createViews(): Partial<Views> {
  const views: Partial<Views> = {};

  for (const [id, config] of Object.entries(viewConfigs) as [
    ViewId,
    ViewConfig,
  ][]) {
    const view =
      config.kind === "map" ? new MapView(config) : new UIPanelView(config);

    if (id === "fps" && config.kind === "ui") {
      (view as UIPanelView).updateRow({ string: "FPS: calc..." });
    }

    if (id === "gitTag" && config.kind === "ui") {
      (view as UIPanelView).updateRow({ string: "VER: GITTAG" });
    }

    views[id as keyof Views] = view as any;
  }

  return views;
}
