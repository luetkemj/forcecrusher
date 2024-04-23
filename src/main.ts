import "./style.css";
import { mean } from "lodash";
import { setupCanvas, View } from "./lib/canvas";
import { Pos, toPosId } from "./lib/grid";
import { getOrCreateWorld } from "./ecs/engine";

export type State = {
  fps: number;
  views: {
    fps?: View;
    map?: View;
    log?: View;
    senses?: View;
    legend?: View;
    inventory?: View;
    menuUnderlay?: View;
    controls?: View;
    cursor?: View;
  };
  zone: Pos;
};

// for debugging
declare global {
  interface Window {
    skulltooth: {
      state: State;
    };
  }
}
window.skulltooth = window.skulltooth || {};

const state: State = {
  fps: 0,
  views: {},
  zone: { x: 0, y: 0, z: 0 },
};

window.skulltooth.state = state;

export const setState = (callback: Function): void => {
  callback(state);
};

export const getState = (): State => state;

const init = async () => {
  await setupCanvas(document.querySelector<HTMLCanvasElement>("#canvas")!);

  // const worldPosId = toPosId(getState().zone);
  getOrCreateWorld(getState().zone)

  // setState((state: State) => {
  //   state.worlds[worldPosId] = createNewWorld();
  // });

  new View({
    width: 12,
    height: 2,
    x: 0,
    y: 0,
    layers: 2,
    tileSets: ["tile", "text"],
    tints: [0xffffff, 0xff0077],
    alphas: [1, 1],
    visible: true,
  }).updateRows([
    [{}, { string: "skulltooth 2" }],
    [{ tint: 0xff0077 }, { string: "forcecrusher", tint: 0xffffff }],
  ]);

  const legendView = new View({
    width: 25,
    height: 42,
    x: 0,
    y: 2,
    layers: 1,
    tileSets: ["text"],
    tints: [0xff0077],
    alphas: [1],
    visible: true,
  });

  const logView = new View({
    width: 74,
    height: 5,
    x: 26,
    y: 0,
    layers: 1,
    tileSets: ["text"],
    tints: [0xeeeeee],
    alphas: [1],
    visible: true,
  });

  const sensesView = new View({
    width: 74,
    height: 5,
    x: 100,
    y: 0,
    layers: 1,
    tileSets: ["text"],
    tints: [0xff0077],
    alphas: [1],
    visible: true,
  });

  // 3 render layers
  // 1: background
  // 2: character
  // 3: foreground
  const mapView = new View({
    width: 74,
    height: 39,
    x: 13,
    y: 5,
    layers: 3,
    tileSets: ["tile", "ascii", "tile"],
    tints: [0x000000, 0x000000, 0x000000],
    alphas: [1, 1, 0],
    visible: true,
  });

  const fpsView = new View({
    width: 12,
    height: 1,
    x: 0,
    y: 44,
    layers: 1,
    tileSets: ["text"],
    tints: [0xdddddd],
    alphas: [1],
    visible: true,
  }).updateRows([[{ string: "FPS: calc..." }]]);

  new View({
    width: 12,
    height: 1,
    x: 0,
    y: 45,
    layers: 1,
    tileSets: ["text"],
    tints: [0xffffff],
    alphas: [1],
    visible: true,
  }).updateRows([[{ string: "TAG: GITHASH" }]]);

  // keyboard controls
  const controlsView = new View({
    width: 148,
    height: 2,
    x: 26,
    y: 44,
    layers: 1,
    tileSets: ["text"],
    tints: [0xeeeeee],
    alphas: [1],
    visible: true,
  });

  // MENUS
  // menu underlay (goes over game view, below menu views)
  const menuUnderlayView = new View({
    width: 100,
    height: 44,
    x: 0,
    y: 0,
    layers: 1,
    tileSets: ["tile"],
    tints: [0x111111],
    alphas: [0.75],
    visible: false,
  });

  // Inventory Menu
  const inventoryView = new View({
    width: 148,
    height: 39,
    x: 26,
    y: 5,
    layers: 2,
    tileSets: ["text", "text"],
    tints: [0x111111, 0xffffff],
    alphas: [1],
    visible: false,
  });

  setState((state: State) => {
    state.views.fps = fpsView;
    state.views.map = mapView;
    state.views.log = logView;
    state.views.senses = sensesView;
    state.views.legend = legendView;
    state.views.inventory = inventoryView;
    state.views.menuUnderlay = menuUnderlayView;
    state.views.controls = controlsView;
  });

  gameLoop();
};

let fps = 0;
let now = Date.now();
let fpsSamples: Array<Number> = [];

function gameLoop() {
  requestAnimationFrame(gameLoop);

  // Track FPS
  {
    if (!now) {
      now = Date.now();
    }
    if (Date.now() - now > 1000) {
      fpsSamples.unshift(fps);
      if (fpsSamples.length > 3) {
        fpsSamples.pop();
      }

      if (!isNaN(getState().fps)) {
        getState().views.fps?.updateRow({
          string: `FPS: ${getState().fps}     `,
          layer: 0,
          x: 0,
          y: 0,
          tileSet: "text",
        });
      }

      now = Date.now();
      fps = 0;
    }

    setState((state: State) => (state.fps = Math.round(mean(fpsSamples))));
    fps++;
  }
}

init();
