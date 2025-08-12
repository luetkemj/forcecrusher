import "./style.css";
import { mean } from "lodash";
import { pxToPosId, setupCanvas } from "./lib/canvas";
import { toPosId } from "./lib/grid";
import { getFrozenEntity, logFrozenEntity } from "./lib/utils";
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
import {
  gameStatePipelines,
  playerTurnPipeline,
  runPipeline,
  systems,
  worldTurnPipeline,
} from "./ecs/systems/systemPipeline";
import { IGNORED_KEYS } from "./ecs/inputHandlers/KeyMap";

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
  const dungeon = generateDungeon();
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

  document.addEventListener("keydown", (ev) => {
    if (IGNORED_KEYS.includes(ev.key)) return;

    setState((state: State) => {
      state.userInput = ev;
    });
  });

  // log entities on mouseclick at position
  document.addEventListener("mousedown", (ev: any) => {
    const x = ev.x - getState().views.map!.layers[0].x;
    const y = ev.layerY - getState().views.map!.layers[0].y;
    const posId = pxToPosId(x, y);

    const entities = gameWorld.world.with("position");

    const debugObject: { posId: string; [key: string]: any } = {
      posId,
    };

    for (const entity of entities) {
      if (posId === toPosId(entity.position)) {
        debugObject[entity.id] = getFrozenEntity(entity);
      }
    }

    const odorMap = getState().odorMap.get(posId);
    const soundMap = getState().soundMap.get(posId);

    debugObject.odors = {
      map: odorMap,
      entities: Object.keys(odorMap ?? {}).map((eid) => {
        const entity = gameWorld.registry.get(eid);
        return entity ? getFrozenEntity(entity) : undefined;
      }),
    };
    debugObject.sounds = {
      map: soundMap,
      entities: Object.keys(soundMap ?? {}).map((eid) => {
        const entity = gameWorld.registry.get(eid);
        return entity ? getFrozenEntity(entity) : undefined;
      }),
    };

    console.log(debugObject);
  });
};

function gameLoop() {
  requestAnimationFrame(gameLoop);
  trackFPS();

  const state = getState();

  const playerCanAct = state.turn === Turn.PLAYER && state.userInput !== null;

  if (state.gameState !== GameState.GAME) {
    if (playerCanAct) {
      runPipeline(gameStatePipelines[state.gameState]!, state.gameState);
    }

    return;
  }

  if (playerCanAct) {
    runPipeline(playerTurnPipeline, "PlayerTurn");

    if (getState().gameState === GameState.GAME) {
      setState((state: State) => {
        state.turn = Turn.WORLD;
      });
    }

    return;
  }

  if (state.turn === Turn.WORLD) {
    runPipeline(worldTurnPipeline, "WorldTurn");

    setState((state: State) => (state.turnNumber += 1));

    setState((state: State) => {
      state.turn = Turn.PLAYER;
    });
  }
}

let fps = 0;
let now = Date.now();
let fpsSamples: number[] = [];

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
