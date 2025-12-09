import { View } from "../lib/canvas";

export type ViewId =
  | "legend"
  | "log"
  | "senses"
  | "map"
  | "mapFire"
  | "mapFluid"
  | "odorMap"
  | "soundMap"
  | "visionMap"
  | "fps"
  | "gitHash"
  | "hud"
  | "controls"
  | "menuUnderlay"
  | "inventory"
  | "logHistory"
  | "makerModeRight"
  | "makerModeLeft"
  | "makerModeTop"
  | "saving"
  | "loading";

type ViewConfig = ConstructorParameters<typeof View>[0];

export const viewConfigs: Record<ViewId, ViewConfig> = {
  legend: {
    width: 25,
    height: 44,
    x: 0,
    y: 0,
    layers: 1,
    tileSets: ["text"],
    tints: [0xff0077],
    alphas: [1],
    visible: true,
    name: "legend",
  },
  log: {
    width: 74,
    height: 5,
    x: 26,
    y: 0,
    layers: 1,
    tileSets: ["text"],
    tints: [0xeeeeee],
    alphas: [1],
    visible: true,
    name: "log",
  },
  senses: {
    width: 74,
    height: 5,
    x: 100,
    y: 0,
    layers: 1,
    tileSets: ["text"],
    tints: [0xeeeeee],
    alphas: [1],
    visible: true,
    name: "senses",
  },

  mapFluid: {
    width: 74,
    height: 39,
    x: 13,
    y: 5,
    layers: 4,
    tileSets: ["kenny"],
    tints: [0x000000, 0x000000, 0x000000, 0x000000],
    alphas: [0, 0, 0, 0],
    visible: true,
    name: "mapFluid",
  },
  // 3 render layers
  // 1: background - ??
  // 2: character - ascii
  // 3: foreground - cursor
  map: {
    width: 74,
    height: 39,
    x: 13,
    y: 5,
    layers: 3,
    tileSets: ["tile", "ascii", "tile"],
    tints: [0x000000, 0x000000, 0x000000],
    alphas: [1, 1, 0],
    visible: true,
    name: "map",
  },

  mapFire: {
    width: 74,
    height: 39,
    x: 13,
    y: 5,
    layers: 3,
    tileSets: ["kenny"],
    tints: [0x000000],
    alphas: [1],
    visible: true,
    name: "mapFire",
  },

  odorMap: {
    width: 74,
    height: 39,
    x: 13,
    y: 5,
    layers: 1,
    tileSets: ["tile"],
    tints: [0x000000],
    alphas: [1],
    visible: true,
    name: "odorMap",
  },

  soundMap: {
    width: 74,
    height: 39,
    x: 13,
    y: 5,
    layers: 1,
    tileSets: ["tile"],
    tints: [0x000000],
    alphas: [1],
    visible: true,
    name: "odorMap",
  },

  visionMap: {
    width: 74,
    height: 39,
    x: 13,
    y: 5,
    layers: 1,
    tileSets: ["tile"],
    tints: [0x000000],
    alphas: [1],
    visible: true,
    name: "visionMap",
  },

  fps: {
    width: 12,
    height: 1,
    x: 0,
    y: 44,
    layers: 1,
    tileSets: ["text"],
    tints: [0x333333],
    alphas: [1],
    visible: true,
    name: "fps",
  },

  gitHash: {
    width: 12,
    height: 1,
    x: 0,
    y: 45,
    layers: 1,
    tileSets: ["text"],
    tints: [0x333333],
    alphas: [1],
    visible: true,
    name: "gitHash",
  },

  hud: {
    width: 26,
    height: 46,
    x: 174,
    y: 0,
    layers: 1,
    tileSets: ["text"],
    tints: [0xdddddd],
    alphas: [1],
    visible: true,
    name: "hud",
  },

  // keyboard controls
  controls: {
    width: 148,
    height: 2,
    x: 26,
    y: 44,
    layers: 1,
    tileSets: ["text"],
    tints: [0x999999],
    alphas: [1],
    visible: true,
    name: "controls",
  },

  // MENUS
  // menu underlay (goes over game view, below menu views)
  menuUnderlay: {
    width: 100,
    height: 44,
    x: 0,
    y: 0,
    layers: 1,
    tileSets: ["tile"],
    tints: [0x111111],
    alphas: [0.75],
    visible: false,
    name: "menuUnderlay",
  },

  // Inventory Menu
  inventory: {
    width: 148,
    height: 39,
    x: 26,
    y: 5,
    layers: 2,
    tileSets: ["text", "text"],
    tints: [0x111111, 0xffffff],
    alphas: [1],
    visible: false,
    name: "inventory",
  },

  logHistory: {
    width: 148,
    height: 44,
    x: 26,
    y: 0,
    layers: 1,
    tileSets: ["text"],
    tints: [0xffffff],
    alphas: [1],
    visible: false,
    name: "logHistory",
  },

  makerModeRight: {
    width: 26,
    height: 46,
    x: 174,
    y: 0,
    layers: 2,
    tileSets: ["tile", "text"],
    tints: [0x000000, 0xdddddd],
    alphas: [1, 1],
    visible: false,
    name: "makerModeRight",
  },

  makerModeLeft: {
    width: 25,
    height: 44,
    x: 0,
    y: 0,
    layers: 2,
    tileSets: ["tile", "text"],
    tints: [0x000000, 0xdddddd],
    alphas: [1, 1],
    visible: false,
    name: "makerModeLeft",
  },
  makerModeTop: {
    width: 148,
    height: 5,
    x: 26,
    y: 0,
    layers: 2,
    tileSets: ["tile", "text"],
    tints: [0x000000, 0xeeeeee],
    alphas: [1, 1],
    visible: false,
    name: "makerModeTop",
  },
  // saving screen
  saving: {
    width: 148,
    height: 39,
    x: 26,
    y: 5,
    layers: 2,
    tileSets: ["text", "text"],
    tints: [0x111111, 0xffffff],
    alphas: [1],
    visible: false,
    name: "saving",
  },
  // loading screen
  loading: {
    width: 148,
    height: 39,
    x: 26,
    y: 5,
    layers: 1,
    tileSets: ["text"],
    tints: [0xffffff],
    alphas: [1],
    visible: false,
    name: "saving",
  },
};

export function createViews() {
  const views: Partial<Record<ViewId, View>> = {};

  for (const [id, config] of Object.entries(viewConfigs) as [
    ViewId,
    ViewConfig,
  ][]) {
    const view = new View(config);

    if (id === "fps") {
      view.updateRows([[{ string: "FPS: calc..." }]]);
    }
    if (id === "gitHash") {
      view.updateRows([[{ string: "TAG: GITHASH" }]]);
    }

    views[id] = view;
  }
  return views;
}
