import { createAccumulateEnergySystem } from "../systems/accumulateEnergySystem";
import { createActiveEffectsSystem } from "../systems/activeEffects.system";
import { createAiSystem } from "../systems/ai.system";
import { createTryAttackSystem } from "../systems/tryAttack.system";
import { createCalculateFlammabilitySystem } from "../systems/calculateFlammability.system";
import { createTryCloseSystem } from "../systems/tryClose.system";
import { createCursorSystem } from "../systems/cursor.system";
import { createDamageSystem } from "../systems/damage.system";
import { createDesiccateSystem } from "../systems/desiccate.system";
import { createDestroySystem } from "./destroy.system";
import { createTryDropSystem } from "../systems/tryDrop.system";
import { createFovSystem } from "../systems/fov.system";
import { createFireSystem } from "../systems/fire.system";
import { createFluidSystem } from "../systems/fluid.system";
import { createMutableSystem } from "./mutable.system";
import { createInteractSystem } from "../systems/interact.system";
import { createTryKickSystem } from "../systems/tryKick.system";
import { createKnockbackSystem } from "../systems/knockback.system";
import { createMemorySystem } from "./memory.system";
import { createMixTintsSystem } from "./mixTints.system";
import { createMorgueSystem } from "../systems/morgue.system";
import { createTryMoveSystem } from "../systems/tryMove.system";
import { createOdorSystem } from "../systems/odor.system";
import { createOpenSystem } from "../systems/open.system";
import { createPerceptionSystem } from "./perception.system";
import { createPickUpSystem } from "../systems/pickUp.system";
import { createRenderSystem } from "../systems/render.system";
import { createSoundSystem } from "../systems/sound.system";
import { createThrowSystem } from "../systems/throw.system";
import { createTryCastSpellSystem } from "../systems/tryCastSpell.system";
import { createTryFillSystem } from "../systems/tryFill.system";
import { createTryReadSystem } from "../systems/tryRead.system";
import { createUncastSpellSystem } from "./uncastSpell.system";
import { createUserInputSystem } from "../systems/userInput.system";
import { createWetSystem } from "../systems/wet.system";
import { gameWorld } from "../engine";
import { GameState } from "../gameState";
import { styleDuration } from "./debug-utils";

const accumulateEnergySystem = createAccumulateEnergySystem(gameWorld);
const activeEffectsSystem = createActiveEffectsSystem(gameWorld);
const aiSystem = createAiSystem(gameWorld);
const tryAttackSystem = createTryAttackSystem(gameWorld);
const calculateFlammabilitySystem =
  createCalculateFlammabilitySystem(gameWorld);
const tryCloseSystem = createTryCloseSystem(gameWorld);
const cursorSystem = createCursorSystem(gameWorld);
const damageSystem = createDamageSystem(gameWorld);
const desiccateSystem = createDesiccateSystem(gameWorld);
const destroySystem = createDestroySystem(gameWorld);
const tryDropSystem = createTryDropSystem(gameWorld);
const fovSystem = createFovSystem(gameWorld);
const fireSystem = createFireSystem(gameWorld);
const fluidSystem = createFluidSystem(gameWorld);
const mutableSystem = createMutableSystem(gameWorld);
const interactSystem = createInteractSystem(gameWorld);
const tryKickSystem = createTryKickSystem(gameWorld);
const knockbackSystem = createKnockbackSystem(gameWorld);
const memorySystem = createMemorySystem(gameWorld);
const mixTintsSystem = createMixTintsSystem(gameWorld);
const morgueSystem = createMorgueSystem(gameWorld);
const tryMoveSystem = createTryMoveSystem(gameWorld);
const odorSystem = createOdorSystem(gameWorld);
const openSystem = createOpenSystem(gameWorld);
const perceptionSystem = createPerceptionSystem(gameWorld);
const pickUpSystem = createPickUpSystem(gameWorld);
const renderSystem = createRenderSystem(gameWorld);
const soundSystem = createSoundSystem(gameWorld);
const throwSystem = createThrowSystem(gameWorld);
const tryCastSpellSystem = createTryCastSpellSystem(gameWorld);
const tryFillSystem = createTryFillSystem(gameWorld);
const tryReadSystem = createTryReadSystem(gameWorld);
const userInputSystem = createUserInputSystem(gameWorld);
const uncastSpellSystem = createUncastSpellSystem(gameWorld);
const wetSystem = createWetSystem(gameWorld);

export const systems = {
  accumulateEnergy: accumulateEnergySystem,
  activeEffects: activeEffectsSystem,
  ai: aiSystem,
  attack: tryAttackSystem,
  calculateFlammability: calculateFlammabilitySystem,
  close: tryCloseSystem,
  cursor: cursorSystem,
  damage: damageSystem,
  desiccate: desiccateSystem,
  destroy: destroySystem,
  drop: tryDropSystem,
  fire: fireSystem,
  fluid: fluidSystem,
  fov: fovSystem,
  interact: interactSystem,
  kick: tryKickSystem,
  knockback: knockbackSystem,
  memory: memorySystem,
  mixTints: mixTintsSystem,
  morgue: morgueSystem,
  movement: tryMoveSystem,
  mutable: mutableSystem,
  odor: odorSystem,
  open: openSystem,
  perception: perceptionSystem,
  pickUp: pickUpSystem,
  render: renderSystem,
  sound: soundSystem,
  throw: throwSystem,
  tryCastSpell: tryCastSpellSystem,
  tryFill: tryFillSystem,
  tryRead: tryReadSystem,
  userInput: userInputSystem,
  uncastSpellSystem: uncastSpellSystem,
  wet: wetSystem,
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
export const tickPipeline: SystemPipeline = {
  preInput: [
    systems.accumulateEnergy,
    systems.uncastSpellSystem,
    systems.fluid,
    systems.wet,
    systems.fire,
    systems.desiccate,
    systems.activeEffects,
    systems.odor,
    systems.sound,
  ],
  input: [],
  main: [systems.damage, systems.morgue],
  postMain: [
    systems.calculateFlammability,
    systems.mutable,
    systems.mixTints,
    systems.destroy,
    systems.fov,
  ],
  render: [],
};

export const actorTurnPipeline: SystemPipeline = {
  preInput: [systems.activeEffects],
  input: [systems.userInput, systems.perception, systems.memory, systems.ai],
  main: [
    systems.pickUp,
    systems.tryFill,
    systems.tryCastSpell,
    systems.movement,
    systems.open,
    systems.close,
    systems.attack,
    systems.knockback,
    systems.kick,
    systems.damage,
    systems.drop,
    systems.throw,
  ],
  postMain: [systems.morgue, systems.destroy, systems.fov],
  render: [],
};

export const gameStatePipelines: Partial<Record<GameState, SystemPipeline>> = {
  [GameState.SCREEN_TITLE]: {
    preInput: [],
    input: [systems.userInput],
    main: [],
    postMain: [],
    render: [systems.render],
  },

  [GameState.SCREEN_VICTORY]: {
    preInput: [],
    input: [systems.userInput],
    main: [],
    postMain: [],
    render: [systems.render],
  },

  [GameState.SCREEN_BEASTIARY]: {
    preInput: [],
    input: [systems.userInput],
    main: [],
    postMain: [],
    render: [systems.render],
  },

  [GameState.CAST_SPELL]: {
    preInput: [],
    input: [systems.userInput],
    main: [systems.cursor],
    postMain: [],
    render: [systems.render],
  },

  [GameState.GAME_OVER]: {
    preInput: [],
    input: [systems.userInput],
    main: [],
    postMain: [],
    render: [systems.render],
  },

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
    main: [systems.cursor],
    postMain: [],
    render: [systems.render],
  },

  [GameState.INVENTORY]: {
    preInput: [],
    input: [systems.userInput],
    main: [systems.activeEffects, systems.drop, systems.tryRead],
    postMain: [systems.destroy, systems.fov],
    render: [systems.render],
  },

  [GameState.INTERACT]: {
    preInput: [],
    input: [systems.userInput],
    main: [systems.interact],
    postMain: [],
    render: [systems.render],
  },

  [GameState.INTERACT_ACTION]: {
    preInput: [],
    input: [systems.userInput],
    main: [],
    postMain: [],
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

  [GameState.SPELLBOOK]: {
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
