import "./style.css";
import { mean } from "lodash";

import { pxToPosId, setupCanvas, View } from "./lib/canvas";
import { Pos, toPosId } from "./lib/grid";
import { logFrozenEntity } from "./lib/utils";

import { createActiveEffectsSystem } from "./ecs/systems/activeEffects.system";
import { aiSystem } from "./ecs/systems/ai.system";
import { attackSystem } from "./ecs/systems/attack.system";
import { cursorSystem } from "./ecs/systems/cursor.system";
import { fovSystem } from "./ecs/systems/fov.system";
import { dropSystem } from "./ecs/systems/drop.system";
import { morgueSystem } from "./ecs/systems/morgue.system";
import { movementSystem } from "./ecs/systems/movement.system";
import { pickUpSystem } from "./ecs/systems/pickUp.system";
import { renderSystem } from "./ecs/systems/render.system";
import { throwSystem } from "./ecs/systems/throw.system";
import { userInputSystem } from "./ecs/systems/userInput.system";

import { generateDungeon } from "./pcgn/dungeon";

import { gameWorld } from "./ecs/engine";
import { spawnPlayer } from "./pcgn/player";
import { damageSystem } from "./ecs/systems/damage.system";

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
  cursor: [Pos, Pos];
  fps: number;
  gameState: GameState;
  log: Array<string>;
  inventoryActiveIndex: number;
  senses: {
    feel: string;
    see: string;
    hear: string;
    smell: string;
    taste: string;
  };
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
    hud?: View;
  };
  zoneId: string;
  playerId: string;
  version: number;
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
  cursor: [
    { x: 0, y: 0, z: 0 },
    { x: 0, y: 0, z: 0 },
  ],
  fps: 0,
  gameState: GameState.GAME,
  log: ["hello world", "your adventure begins anew!"],
  inventoryActiveIndex: 0,
  senses: {
    feel: "You feel nothing.",
    see: "You see nothing.",
    hear: "You hear nothing.",
    smell: "You smell nothing.",
    taste: "You taste nothing.",
  },
  turn: Turn.PLAYER,
  userInput: null,
  views: {},
  zoneId: "0,0,0",
  playerId: "",
  version: 1,
};

window.skulltooth.state = state;

export const setState = (callback: Function): void => {
  callback(state);
};

export const getState = (): State => state;

const activeEffectsSystem = createActiveEffectsSystem(gameWorld.world);

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

  const hudView = new View({
    width: 26,
    height: 46,
    x: 174,
    y: 0,
    layers: 1,
    tileSets: ["text"],
    tints: [0xdddddd],
    alphas: [1],
    visible: true,
  });

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
    state.views.hud = hudView;
  });

  // create world
  const dungeon = generateDungeon(getState().zoneId);
  if (!dungeon) return;
  const startPos = dungeon.rooms[0].center;
  const player = spawnPlayer(startPos);

  setState((state: State) => {
    state.playerId = player.id;
  });

  gameWorld.saveZone(getState().zoneId);

  // initial render before kicking off the game loop
  fovSystem();
  renderSystem();
  gameLoop();

  const metaKeys = ["Shift", "Meta", "Control", "Alt"];
  document.addEventListener("keydown", (ev) => {
    // ignore metaKeys
    if (metaKeys.includes(ev.key)) return;

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
      const entities = gameWorld.world.with("position");

      for (const entity of entities) {
        if (posId === toPosId(entity.position)) {
          console.log(posId);
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

  if (getState().gameState === GameState.INSPECT) {
    if (getState().userInput && getState().turn === Turn.PLAYER) {
      userInputSystem();
      cursorSystem();
      renderSystem();
    }
  }

  if (getState().gameState === GameState.TARGET) {
    if (getState().userInput && getState().turn === Turn.PLAYER) {
      userInputSystem();
      cursorSystem();
      throwSystem();
      renderSystem();
    }
  }

  if (getState().gameState === GameState.INVENTORY) {
    if (getState().userInput && getState().turn === Turn.PLAYER) {
      userInputSystem();
      activeEffectsSystem();
      dropSystem();
      fovSystem();
      renderSystem();
    }
  }

  if (getState().gameState === GameState.GAME) {
    // systems
    if (getState().userInput && getState().turn === Turn.PLAYER) {
      activeEffectsSystem();
      userInputSystem();
      pickUpSystem();
      dropSystem();
      movementSystem();
      attackSystem();
      damageSystem();
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
      activeEffectsSystem();
      morgueSystem();
      aiSystem();
      movementSystem();
      attackSystem();
      damageSystem();
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
