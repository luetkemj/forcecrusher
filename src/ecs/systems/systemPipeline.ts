import { createActiveEffectsSystem } from "../systems/activeEffects.system";
import { createAiSystem } from "../systems/ai.system";
import { createAttackSystem } from "../systems/attack.system";
import { createCloseSystem } from "../systems/close.system";
import { createCursorSystem } from "../systems/cursor.system";
import { createDamageSystem } from "../systems/damage.system";
import { createDropSystem } from "../systems/drop.system";
import { createFovSystem } from "../systems/fov.system";
import { createInteractSystem } from "../systems/interact.system";
import { createKickSystem } from "../systems/kick.system";
import { createKnockbackSystem } from "../systems/knockback.system";
import { createMorgueSystem } from "../systems/morgue.system";
import { createMovementSystem } from "../systems/movement.system";
import { createOpenSystem } from "../systems/open.system";
import { createPickUpSystem } from "../systems/pickUp.system";
import { createRenderSystem } from "../systems/render.system";
import { createThrowSystem } from "../systems/throw.system";
import { createUserInputSystem } from "../systems/userInput.system";
import { gameWorld } from "../engine";
import { GameState } from "../gameState";

const activeEffectsSystem = createActiveEffectsSystem(gameWorld);
const aiSystem = createAiSystem(gameWorld);
const attackSystem = createAttackSystem(gameWorld);
const closeSystem = createCloseSystem(gameWorld);
const cursorSystem = createCursorSystem(gameWorld);
const damageSystem = createDamageSystem(gameWorld);
const dropSystem = createDropSystem(gameWorld);
const fovSystem = createFovSystem(gameWorld);
const interactSystem = createInteractSystem(gameWorld);
const kickSystem = createKickSystem(gameWorld);
const knockbackSystem = createKnockbackSystem(gameWorld);
const morgueSystem = createMorgueSystem(gameWorld);
const movementSystem = createMovementSystem(gameWorld);
const openSystem = createOpenSystem(gameWorld);
const pickUpSystem = createPickUpSystem(gameWorld);
const renderSystem = createRenderSystem(gameWorld);
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
  fov: fovSystem,
  interact: interactSystem,
  kick: kickSystem,
  knockback: knockbackSystem,
  morgue: morgueSystem,
  movement: movementSystem,
  open: openSystem,
  pickUp: pickUpSystem,
  render: renderSystem,
  throw: throwSystem,
  userInput: userInputSystem,
};

type SystemFn = () => void;

type SystemPhase = "preInput" | "input" | "main" | "postMain" | "render";

type SystemPipeline = Partial<Record<SystemPhase, SystemFn[]>>;

export const runPipeline = (pipeline: SystemPipeline) => {
  const order: SystemPhase[] = [
    "preInput",
    "input",
    "main",
    "postMain",
    "render",
  ];
  for (const phase of order) {
    for (const fn of pipeline[phase] ?? []) {
      fn();
    }
  }
};

export const pipelines: Partial<Record<GameState, SystemPipeline>> = {
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
    postMain: [],
    render: [systems.render],
  },
};
