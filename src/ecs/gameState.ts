import { type Pos } from "../lib/grid";
import { View } from "../lib/canvas";
import { Entity } from "./engine";

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
  senses: {
    feel: string;
    see: string;
    hear: string;
    smell: string;
    taste: string;
  };
  turn: Turn;
  userInput: KeyboardEvent | null;
  views: Views;
  zoneId: string;
  playerId: string;
  version: number;
};

const state: State = {
  cursor: [
    { x: 0, y: 0, z: 0 },
    { x: 0, y: 0, z: 0 },
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

export const setState = (callback: Function): void => {
  callback(state);
};

export const getState = (): State => state;
