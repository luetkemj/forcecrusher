import "./style.css";
import { isUndefined, mean } from "lodash";
import { pxToPosId, setupCanvas } from "./lib/canvas";
import { toPosId } from "./lib/grid";
import { getFrozenEntity } from "./lib/utils";
import { generateDungeon } from "./pcgn/dungeon";
import { spawnPlayer } from "./pcgn/player";
import { ACTION_COST, gameWorld, IGameWorld } from "./ecs/engine";
import { type State, GameState, getState, setState } from "./ecs/gameState";
import { createViews, ViewId } from "./views/views";
import {
  actorTurnPipeline,
  tickPipeline,
  gameStatePipelines,
  runPipeline,
  systems,
} from "./ecs/systems/systemPipeline";
import { handleUserInput } from "./ecs/inputHandlers/KeyMap";
import { TileSet } from "./ecs/enums";

// for debugging
declare global {
  interface Window {
    skulltooth: {
      state: State;
      debug: boolean;
      gameWorld: IGameWorld;
    };
  }
}
window.skulltooth = window.skulltooth || {};
window.skulltooth.debug = false;
window.skulltooth.state = getState();
window.skulltooth.gameWorld = gameWorld;

const init = async () => {
  // setup canvas
  await setupCanvas(document.querySelector<HTMLCanvasElement>("#canvas")!);

  // create views
  const views = createViews();

  // store views
  setState((state: State) => {
    for (const id of Object.keys(views) as ViewId[]) {
      state.views[id] = views[id]! as any;
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

  document.addEventListener("keydown", (ev) => {
    const disableKeyStates = [GameState.LOADING, GameState.SAVING];
    if (!disableKeyStates.includes(getState().gameState)) {
      handleUserInput(ev);
    }
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

// where should these go?
export function getCurrentActor() {
  const { currentActorId } = getState();

  return gameWorld.registry.get(currentActorId || "");
}

function buildReadyQueue(): string[] {
  const actors = gameWorld.world.with("energy", "speed", "initiative");
  const ready: any[] = [];

  for (const actor of actors) {
    if (actor.energy >= ACTION_COST) {
      ready.push(actor);
    }
  }

  ready.sort((a, b) => a.initiative - b.initiative);

  return ready.map((a) => a.id);
}

function runActorTurn(actorId: string) {
  setState((state: State) => (state.currentActorId = actorId));

  runPipeline(actorTurnPipeline, "ActorTurn");

  // spend energy AFTER action
  const actor = gameWorld.registry.get(actorId);

  if (actor && !isUndefined(actor.energy)) {
    actor.energy -= ACTION_COST;
  }
}

function simulationFrame() {
  // Batch all ready actor turns into a single frame.
  // Process until the player needs input or no one is ready.
  const MAX_ITERATIONS = 200;
  let iterations = 0;
  let playerActedThisFrame = false;

  while (iterations++ < MAX_ITERATIONS) {
    const queue = buildReadyQueue();

    if (queue.length === 0) {
      runPipeline(tickPipeline, "Tick");
      // If still nobody ready after tick, stop
      if (buildReadyQueue().length === 0) break;
      continue;
    }

    const actorId = queue[0];
    const isPlayer = actorId === getState().playerId;
    const hasInput = getState().userInput !== null;

    // Wait for player input
    if (isPlayer && !hasInput) break;
    // Player already acted this frame — show results before next input
    if (isPlayer && playerActedThisFrame) break;

    runActorTurn(actorId);
    if (isPlayer) playerActedThisFrame = true;
  }

  runPipeline({ render: [systems.render] }, "Render");
}

function gameLoop() {
  requestAnimationFrame(gameLoop);
  trackFPS();

  const state = getState();

  if (state.gameState !== GameState.GAME) {
    runPipeline(gameStatePipelines[state.gameState]!, state.gameState);

    return;
  }

  if (state.gameState === GameState.GAME) {
    simulationFrame();
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
        tileSet: TileSet.Text,
      });
    }

    now = Date.now();
    fps = 0;
  }

  fps++;
}

init();
