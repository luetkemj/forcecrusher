import { PosId, type Pos } from "../lib/grid";
import { View } from "../lib/canvas";
import { Entity, EntityId } from "./engine";
import { VisibleFov } from "../lib/fov";

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
  LOG_HISTORY = "LOG_HISTORY",
  INTERACT = "INTERACT",
  INTERACT_ACTION = "INTERACT_ACTION",
  MAKER_MODE = "MAKER_MODE",
  MAKER_MODE_PREFAB_SELECT = "MAKER_MODE_PREFAB_SELECT",
}

export type Views = {
  fps?: View;
  gitHash?: View;
  map?: View;
  odorMap?: View;
  soundMap?: View;
  visionMap?: View;
  log?: View;
  senses?: View;
  legend?: View;
  inventory?: View;
  menuUnderlay?: View;
  controls?: View;
  cursor?: View;
  hud?: View;
  logHistory?: View;
  makerModeLeft?: View;
  makerModeRight?: View;
  makerModeTop?: View;
};

export type State = {
  cursor: [Pos, Pos];
  fps: number;
  gameState: GameState;
  log: Array<string>;
  logActiveIndex: number;
  inventoryActiveIndex: number;
  interactKey: string;
  interactTargets: Array<Entity>;
  interactActions: string;
  makerModePrefabSelectIndex: number;
  odorMap: Map<PosId, Record<EntityId, { strength: number }>>;
  soundMap: Map<PosId, Record<EntityId, { strength: number }>>;
  visionMap: Array<{ fov: VisibleFov; canSeePc: boolean }>;
  senses: {
    sight: string;
    hearing: string;
    smell: string;
    taste: string;
    touch: string;
  };
  turn: Turn;
  turnNumber: number;
  userInput: KeyboardEvent | null;
  views: Views;
  zoneId: string;
  playerId: string;
  version: number;
  cheats: {
    seeAll: boolean;
    seeOdorMap: boolean;
    seeSoundMap: boolean;
    seeVisionMap: boolean;
  };
};

const state: State = {
  cursor: [
    { x: 0, y: 0 },
    { x: 0, y: 0 },
  ],
  fps: 0,
  gameState: GameState.GAME,
  log: ["hello world", "your adventure begins anew!"],
  logActiveIndex: 0,
  inventoryActiveIndex: 0,
  interactKey: "",
  interactTargets: [],
  interactActions: "",
  makerModePrefabSelectIndex: 0,
  odorMap: new Map(),
  soundMap: new Map(),
  visionMap: [],
  senses: {
    sight: "",
    hearing: "",
    smell: "",
    taste: "",
    touch: "",
  },
  turn: Turn.PLAYER,
  turnNumber: 0, // this needs to be stored in game saves
  userInput: null,
  views: {},
  zoneId: "0,0,0",
  playerId: "",
  version: 1,
  cheats: {
    seeAll: false,
    seeOdorMap: false,
    seeSoundMap: false,
    seeVisionMap: false,
  },
};

export const setState = (callback: Function): void => {
  callback(state);
};

export const getState = (): State => state;
