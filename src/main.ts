import "./style.css";
import { mean } from "lodash";
import { pxToPosId, setupCanvas } from "./lib/canvas";
import { toPosId } from "./lib/grid";
import { logFrozenEntity } from "./lib/utils";
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
import { pipelines, runPipeline, systems } from "./ecs/systems/systemPipeline";

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
  runPipeline({
    preInput: [],
    input: [],
    main: [],
    postMain: [systems.fov],
    render: [systems.render],
  });

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

function gameLoop() {
  requestAnimationFrame(gameLoop);

  const state = getState();

  const playerCanAct = state.turn === Turn.PLAYER && state.userInput !== null;

  if (state.gameState !== GameState.GAME) {
    if (playerCanAct) {
      runPipeline(pipelines[state.gameState]!);
    }

    return;
  }

  if (playerCanAct) {
    runPipeline({
      preInput: [systems.activeEffects],
      input: [systems.userInput],
      main: [
        systems.pickUp,
        systems.movement,
        systems.open,
        systems.attack,
        systems.knockback,
        systems.damage,
        systems.morgue,
        systems.drop,
      ],
      postMain: [systems.fov],
      render: [systems.render],
    });

    if (getState().gameState === GameState.GAME) {
      setState((state: State) => {
        state.turn = Turn.WORLD;
      });
    }
  }

  if (state.turn === Turn.WORLD) {
    runPipeline({
      preInput: [systems.activeEffects, systems.morgue],
      input: [],
      main: [
        systems.ai,
        systems.movement,
        systems.open,
        systems.attack,
        systems.knockback,
        systems.damage,
        systems.morgue,
        systems.drop,
      ],
      postMain: [systems.fov],
      render: [systems.render],
    });

    setState((state: State) => {
      state.turn = Turn.PLAYER;
    });
  }

  trackFPS();
}

let fps = 0;
let now = Date.now();
let fpsSamples: number[];

function trackFPS() {
  if (!now) now = Date.now();

  if (Date.now() - now > 1000) {
    fpsSamples.unshift(fps);
    if (fpsSamples.length > 3) fpsSamples.pop();

    const avg = Math.round(mean(fpsSamples));
    setState((state: State) => (state.fps = avg));

    if (!isNaN(avg)) {
      getState().views.fps?.updateRow({
        string: `FPS: ${avg}     `,
        layer: 0,
        x: 0,
        y: 0,
        tileSet: "text",
      });
    }

    now = Date.now();
    fps = 0;
  }

  fps++;
}

init();
