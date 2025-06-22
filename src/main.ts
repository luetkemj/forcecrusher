import "./style.css";
import { mean } from "lodash";

import { pxToPosId, setupCanvas, View } from "./lib/canvas";
import { toPosId } from "./lib/grid";
import { logFrozenEntity } from "./lib/utils";

import { createActiveEffectsSystem } from "./ecs/systems/activeEffects.system";
import { createAiSystem } from "./ecs/systems/ai.system";
import { createAttackSystem } from "./ecs/systems/attack.system";
import { createCloseSystem } from "./ecs/systems/close.system";
import { createCursorSystem } from "./ecs/systems/cursor.system";
import { createDamageSystem } from "./ecs/systems/damage.system";
import { createDropSystem } from "./ecs/systems/drop.system";
import { createFovSystem } from "./ecs/systems/fov.system";
import { createInteractSystem } from "./ecs/systems/interact.system";
import { createKickSystem } from "./ecs/systems/kick.system";
import { createKnockbackSystem } from "./ecs/systems/knockback.system";
import { createMorgueSystem } from "./ecs/systems/morgue.system";
import { createMovementSystem } from "./ecs/systems/movement.system";
import { createOpenSystem } from "./ecs/systems/open.system";
import { createPickUpSystem } from "./ecs/systems/pickUp.system";
import { createRenderSystem } from "./ecs/systems/render.system";
import { createThrowSystem } from "./ecs/systems/throw.system";
import { createUserInputSystem } from "./ecs/systems/userInput.system";

import { generateDungeon } from "./pcgn/dungeon";

import { gameWorld } from "./ecs/engine";
import { spawnPlayer } from "./pcgn/player";
import {
  type State,
  GameState,
  Turn,
  getState,
  setState,
} from "./ecs/gameState";

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

window.skulltooth.state = getState();

const activeEffectsSystem = createActiveEffectsSystem(gameWorld.world);
const aiSystem = createAiSystem(gameWorld.world);
const attackSystem = createAttackSystem(gameWorld.world, gameWorld.registry);
const closeSystem = createCloseSystem(gameWorld.world);
const cursorSystem = createCursorSystem(gameWorld.world);
const damageSystem = createDamageSystem(gameWorld.world, gameWorld.registry);
const openSystem = createOpenSystem(gameWorld.world, gameWorld.registry);
const dropSystem = createDropSystem(gameWorld.world, gameWorld.registry);
const fovSystem = createFovSystem(gameWorld.world);
const interactSystem = createInteractSystem(
  gameWorld.world,
  gameWorld.registry,
);
const kickSystem = createKickSystem(gameWorld.world, gameWorld.registry);
const knockbackSystem = createKnockbackSystem(
  gameWorld.world,
  gameWorld.registry,
);
const morgueSystem = createMorgueSystem(gameWorld.world, gameWorld.registry);
const movementSystem = createMovementSystem(gameWorld.world);
const pickUpSystem = createPickUpSystem(gameWorld.world, gameWorld.registry);
const renderSystem = createRenderSystem(gameWorld.world, gameWorld.registry);
const throwSystem = createThrowSystem(gameWorld.world, gameWorld.registry);
const userInputSystem = createUserInputSystem(
  gameWorld.world,
  gameWorld.registry,
  gameWorld.saveGameData,
  gameWorld.loadGameData,
  gameWorld.changeZone,
);

const init = async () => {
  await setupCanvas(document.querySelector<HTMLCanvasElement>("#canvas")!);

  const legendView = new View({
    width: 25,
    height: 44,
    x: 0,
    y: 0,
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
    tints: [0x333333],
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
    tints: [0x333333],
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
    tints: [0x999999],
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

  const logHistoryView = new View({
    width: 148,
    height: 44,
    x: 26,
    y: 0,
    layers: 1,
    tileSets: ["text"],
    tints: [0xffffff],
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
    state.views.logHistory = logHistoryView;
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
    const x = ev.x - getState().views.map!.layers[0].x;
    const y = ev.layerY - getState().views.map!.layers[0].y;
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

  if (getState().gameState === GameState.INTERACT) {
    if (getState().userInput && getState().turn === Turn.PLAYER) {
      userInputSystem();
      interactSystem();
      fovSystem();
      renderSystem();
    }
  }

  if (getState().gameState === GameState.INTERACT_ACTION) {
    if (getState().userInput && getState().turn === Turn.PLAYER) {
      userInputSystem();
      interactSystem();
      activeEffectsSystem(); // NOTE: this might not be in the right spot.
      pickUpSystem();
      movementSystem();
      closeSystem();
      openSystem();
      kickSystem();
      attackSystem();
      knockbackSystem();
      damageSystem();
      morgueSystem();
      dropSystem();
      fovSystem();
      renderSystem();

      // game state and turns are updated in userInput system
    }
  }

  if (getState().gameState === GameState.LOG_HISTORY) {
    if (getState().userInput && getState().turn === Turn.PLAYER) {
      userInputSystem();
      renderSystem();
    }
  }

  if (getState().gameState === GameState.GAME) {
    // systems
    if (getState().userInput && getState().turn === Turn.PLAYER) {
      activeEffectsSystem();
      userInputSystem();
      pickUpSystem();
      movementSystem();
      openSystem();
      attackSystem(); // might need to run this again after knockbackSystem...
      knockbackSystem();
      damageSystem();
      morgueSystem();
      dropSystem();
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
      openSystem();
      attackSystem();
      knockbackSystem();
      damageSystem();
      morgueSystem();
      dropSystem();
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
