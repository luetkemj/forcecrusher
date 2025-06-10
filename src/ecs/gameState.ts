import { type Pos } from "../lib/grid";
import { View } from "../lib/canvas";

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
}

export type State = {
  cursor: [Pos, Pos];
  fps: number;
  gameState: GameState;
  log: Array<string>;
  inventoryActiveIndex: number;
  senses: {
    feel: string;
    see: string;
    hear: string;
    smell: string;
    taste: string;
  };
  turn: Turn;
  userInput: KeyboardEvent | null;
  views: {
    fps?: View;
    map?: View;
    log?: View;
    senses?: View;
    legend?: View;
    inventory?: View;
    menuUnderlay?: View;
    controls?: View;
    cursor?: View;
    hud?: View;
  };
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
  inventoryActiveIndex: 0,
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
