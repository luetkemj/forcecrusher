import "./style.css";
import { mean } from "lodash";
import { pxToPosId, setupCanvas, View } from "./lib/canvas";
import { aiSystem } from "./ecs/systems/ai.system";
import { fovSystem } from "./ecs/systems/fov.system";
import { movementSystem } from "./ecs/systems/movement.system";
import { renderSystem } from "./ecs/systems/render.system";
import { userInputSystem } from "./ecs/systems/userInput.system";
import { generateDungeon } from "./pcgn/dungeon";
import { world } from "./ecs/engine";
import { playerPrefab } from "./actors";
import { toPosId } from "./lib/grid";
import { logFrozenEntity } from "./lib/utils";
import { morgueSystem } from "./ecs/systems/morgue.system";

export const enum Turn {
  PLAYER = "PLAYER",
  WORLD = "WORLD",
}

export const enum GameState {
  GAME = "GAME",
  GAME_OVER = "GAME_OVER",
  INVENTORY = "INVENTORY",
  INSPECT = "INSPECT",
  TARGET = "TARGET",
}

export type State = {
  fps: number;
  gameState: GameState;
  turn: Turn;
  userInput: KeyboardEvent | null;
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
};

// for debugging
declare global {
  interface Window {
    skulltooth: {
      state: State;
      debug: boolean;
    };
  }
}
window.skulltooth = window.skulltooth || {};
window.skulltooth.debug = false;

const state: State = {
  fps: 0,
  views: {},
  userInput: null,
  turn: Turn.PLAYER,
  gameState: GameState.GAME,
};

window.skulltooth.state = state;

export const setState = (callback: Function): void => {
  callback(state);
};

export const getState = (): State => state;

const init = async () => {
  await setupCanvas(document.querySelector<HTMLCanvasElement>("#canvas")!);

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

  const dungeon = generateDungeon();
  const startPos = dungeon.rooms[0].center;

  const player = world.add(playerPrefab);
  player.position!.x = startPos.x;
  player.position!.y = startPos.y;
  player.position!.z = startPos.z;

  // initial render before kicking off the game loop
  fovSystem();
  renderSystem();
  gameLoop();

  document.addEventListener("keydown", (ev) => {
    setState((state: State) => {
      state.userInput = ev;
    });
  });

  // log entities on mouseclick at position
  document.addEventListener("mousedown", (ev: any) => {
    const x = ev.x - state.views.map!.layers[0].x;
    const y = ev.layerY - state.views.map!.layers[0].y;
    const z = 0;

    const posId = pxToPosId(x, y, z);

    if (window.skulltooth.debug === true || import.meta.env.DEV) {
      const entities = world.with("position");

      for (const entity of entities) {
        if (posId === toPosId(entity.position)) {
          console.log(posId)
          logFrozenEntity(entity);
        }
      }
    }
  });
};

let fps = 0;
let now = Date.now();
let fpsSamples: Array<Number> = [];

function gameLoop() {
  requestAnimationFrame(gameLoop);

  if (getState().gameState === GameState.GAME) {
    // systems
    if (getState().userInput && getState().turn === Turn.PLAYER) {
      userInputSystem();
      movementSystem();
      morgueSystem();
      fovSystem();
      renderSystem();

      if (getState().gameState === GameState.GAME) {
        setState((state: State) => {
          state.turn = Turn.WORLD;
        });
      }
    }

    if (getState().turn === Turn.WORLD) {
      aiSystem();
      movementSystem();
      morgueSystem();
      fovSystem();
      renderSystem();

      setState((state: State) => {
        state.turn = Turn.PLAYER;
      });
    }
  }

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
