import { createActiveEffectsSystem } from "../systems/activeEffects.system";
import { createAiSystem } from "../systems/ai.system";
import { createAttackSystem } from "../systems/attack.system";
import { createCloseSystem } from "../systems/close.system";
import { createCursorSystem } from "../systems/cursor.system";
import { createDamageSystem } from "../systems/damage.system";
import { createDropSystem } from "../systems/drop.system";
import { createFovSystem } from "../systems/fov.system";
import { createFireSystem } from "../systems/fire.system";
import { createFluidSystem } from "../systems/fluid.system";
import { createGrowthSystem } from "../systems/growth.system";
import { createInteractSystem } from "../systems/interact.system";
import { createKickSystem } from "../systems/kick.system";
import { createKnockbackSystem } from "../systems/knockback.system";
import { createMemorySystem } from "./memory.system";
import { createMorgueSystem } from "../systems/morgue.system";
import { createMovementSystem } from "../systems/movement.system";
import { createOdorSystem } from "../systems/odor.system";
import { createOpenSystem } from "../systems/open.system";
import { createPerceptionSystem } from "./perception.system";
import { createPickUpSystem } from "../systems/pickUp.system";
import { createPostProcessSystem } from "../systems/postProcess.system";
import { createRenderSystem } from "../systems/render.system";
import { createSoundSystem } from "../systems/sound.system";
import { createThrowSystem } from "../systems/throw.system";
import { createUserInputSystem } from "../systems/userInput.system";
import { gameWorld } from "../engine";
import { GameState } from "../gameState";
import { styleDuration } from "./debug-utils";

const activeEffectsSystem = createActiveEffectsSystem(gameWorld);
const aiSystem = createAiSystem(gameWorld);
const attackSystem = createAttackSystem(gameWorld);
const closeSystem = createCloseSystem(gameWorld);
const cursorSystem = createCursorSystem(gameWorld);
const damageSystem = createDamageSystem(gameWorld);
const dropSystem = createDropSystem(gameWorld);
const fovSystem = createFovSystem(gameWorld);
const fireSystem = createFireSystem(gameWorld);
const fluidSystem = createFluidSystem(gameWorld);
const growthSystem = createGrowthSystem(gameWorld);
const interactSystem = createInteractSystem(gameWorld);
const kickSystem = createKickSystem(gameWorld);
const knockbackSystem = createKnockbackSystem(gameWorld);
const memorySystem = createMemorySystem(gameWorld);
const morgueSystem = createMorgueSystem(gameWorld);
const movementSystem = createMovementSystem(gameWorld);
const odorSystem = createOdorSystem(gameWorld);
const openSystem = createOpenSystem(gameWorld);
const perceptionSystem = createPerceptionSystem(gameWorld);
const pickUpSystem = createPickUpSystem(gameWorld);
const postProcessSystem = createPostProcessSystem(gameWorld);
const renderSystem = createRenderSystem(gameWorld);
const soundSystem = createSoundSystem(gameWorld);
const throwSystem = createThrowSystem(gameWorld);
const userInputSystem = createUserInputSystem(gameWorld);

export const systems = {
  activeEffects: activeEffectsSystem,
  ai: aiSystem,
  attack: attackSystem,
  close: closeSystem,
  cursor: cursorSystem,
  damage: damageSystem,
  drop: dropSystem,
  fire: fireSystem,
  fluid: fluidSystem,
  fov: fovSystem,
  growth: growthSystem,
  interact: interactSystem,
  kick: kickSystem,
  knockback: knockbackSystem,
  memory: memorySystem,
  morgue: morgueSystem,
  movement: movementSystem,
  odor: odorSystem,
  open: openSystem,
  perception: perceptionSystem,
  pickUp: pickUpSystem,
  postProcess: postProcessSystem,
  render: renderSystem,
  sound: soundSystem,
  throw: throwSystem,
  userInput: userInputSystem,
};

type SystemFn = () => void;

type SystemPhase = "preInput" | "input" | "main" | "postMain" | "render";

type SystemPipeline = Partial<Record<SystemPhase, SystemFn[]>>;

export const runPipeline = (pipeline: SystemPipeline, label = "") => {
  const order: SystemPhase[] = [
    "preInput",
    "input",
    "main",
    "postMain",
    "render",
  ];

  if (window.skulltooth.debug) {
    const pipelineStart = performance.now();
    for (const phase of order) {
      for (const system of pipeline[phase] ?? []) {
        const start = performance.now();
        system();
        const end = performance.now();

        const duration = end - start;
        const { color: timeColor, emoji } = styleDuration(
          duration,
          system.name,
        );

        console.log(
          `%c[${label}] ▶ %c ${phase.padEnd(9)} %c ⚙ ${system.name.padEnd(18)} %c ${emoji} ${duration.toFixed(2)}ms`,
          "color: gray; font-weight: bold",
          "color: #5e9cff; font-weight: bold",
          "color: #22c55e; font-weight: bold",
          timeColor,
        );
      }
    }
    const pipelineEnd = performance.now();
    const frameTime = pipelineEnd - pipelineStart;

    const { color: frameColor, emoji: frameEmoji } = styleDuration(
      frameTime,
      "FRAME",
    );
    console.log(
      `%c${frameEmoji} Frame Time: ${frameTime.toFixed(2)}ms`,
      frameColor,
    );
  } else {
    for (const phase of order) {
      for (const system of pipeline[phase] ?? []) {
        system();
      }
    }
  }
};

export const playerTurnPipeline: SystemPipeline = {
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
};

export const worldTurnPipeline: SystemPipeline = {
  preInput: [
    systems.growth,
    systems.fluid,
    systems.fire,
    systems.activeEffects,
    systems.morgue,
    systems.odor,
    systems.sound,
  ],
  input: [systems.perception, systems.memory],
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
  postMain: [systems.fov, systems.postProcess],
  render: [systems.render],
};

export const gameStatePipelines: Partial<Record<GameState, SystemPipeline>> = {
  [GameState.INSPECT]: {
    preInput: [],
    input: [systems.userInput],
    main: [systems.cursor],
    postMain: [],
    render: [systems.render],
  },

  [GameState.TARGET]: {
    preInput: [],
    input: [systems.userInput],
    main: [systems.cursor, systems.throw],
    postMain: [],
    render: [systems.render],
  },

  [GameState.INVENTORY]: {
    preInput: [],
    input: [systems.userInput],
    main: [systems.activeEffects, systems.drop],
    postMain: [systems.fov],
    render: [systems.render],
  },

  [GameState.INTERACT]: {
    preInput: [],
    input: [systems.userInput],
    main: [systems.interact],
    postMain: [systems.fov],
    render: [systems.render],
  },

  [GameState.INTERACT_ACTION]: {
    preInput: [],
    input: [systems.userInput],
    main: [
      systems.interact,
      systems.activeEffects,
      systems.pickUp,
      systems.movement,
      systems.close,
      systems.open,
      systems.kick,
      systems.attack,
      systems.knockback,
      systems.damage,
      systems.morgue,
      systems.drop,
    ],
    postMain: [systems.fov],
    render: [systems.render],
  },

  [GameState.LOG_HISTORY]: {
    preInput: [],
    input: [systems.userInput],
    main: [],
    postMain: [],
    render: [systems.render],
  },

  [GameState.MAKER_MODE]: {
    preInput: [],
    input: [systems.userInput],
    main: [],
    postMain: [systems.fov],
    render: [systems.render],
  },

  [GameState.MAKER_MODE_PREFAB_SELECT]: {
    preInput: [],
    input: [systems.userInput],
    main: [],
    postMain: [],
    render: [systems.render],
  },

  [GameState.SAVING]: {
    preInput: [],
    input: [systems.userInput],
    main: [],
    postMain: [],
    render: [systems.render],
  },

  [GameState.LOADING]: {
    preInput: [],
    input: [systems.userInput],
    main: [],
    postMain: [],
    render: [systems.render],
  },
};
