import "./style.css";
import { mean } from "lodash";
import { pxToPosId, setupCanvas } from "./lib/canvas";
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
import { spawnPlayer } from "./pcgn/player";
import { gameWorld } from "./ecs/engine";
import {
  type State,
  GameState,
  Turn,
  getState,
  setState,
} from "./ecs/gameState";
import { createViews, ViewId } from "./views/views";

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

const activeEffectsSystem = createActiveEffectsSystem(gameWorld);
const aiSystem = createAiSystem(gameWorld);
const attackSystem = createAttackSystem(gameWorld);
const closeSystem = createCloseSystem(gameWorld);
const cursorSystem = createCursorSystem(gameWorld);
const damageSystem = createDamageSystem(gameWorld);
const openSystem = createOpenSystem(gameWorld);
const dropSystem = createDropSystem(gameWorld);
const fovSystem = createFovSystem(gameWorld);
const interactSystem = createInteractSystem(gameWorld);
const kickSystem = createKickSystem(gameWorld);
const knockbackSystem = createKnockbackSystem(gameWorld);
const morgueSystem = createMorgueSystem(gameWorld);
const movementSystem = createMovementSystem(gameWorld);
const pickUpSystem = createPickUpSystem(gameWorld);
const renderSystem = createRenderSystem(gameWorld);
const throwSystem = createThrowSystem(gameWorld);
const userInputSystem = createUserInputSystem(gameWorld);

const init = async () => {
  // setup canvas
  await setupCanvas(document.querySelector<HTMLCanvasElement>("#canvas")!);

  // create views
  const views = createViews();

  // store views
  setState((state: State) => {
    for (const id of Object.keys(views) as ViewId[]) {
      state.views[id] = views[id]!;
    }
  });

  // create world
  const dungeon = generateDungeon(getState().zoneId);
  if (!dungeon) return;
  const startPos = dungeon.rooms[0].center;
  const player = spawnPlayer(startPos);

  // add playerId to state
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

  if (getState().gameState === GameState.MAKER_MODE) {
    if (getState().userInput) {
      userInputSystem();
      renderSystem();
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
