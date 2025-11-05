import { State, setState } from "../gameState";

export const IGNORED_KEYS = ["Shift", "Meta", "Control", "Alt"];

export const Keys = {
  MOVE_LEFT: ["ArrowLeft", "h"],
  MOVE_DOWN: ["ArrowDown", "j"],
  MOVE_UP: ["ArrowUp", "k"],
  MOVE_RIGHT: ["ArrowRight", "l"],

  SCROLL_UP: ["ArrowUp", "k"],
  SCROLL_DOWN: ["ArrowDown", "j"],

  ATTACK: "a",
  KICK: "k",
  OPEN: "o",
  PICK_UP: "g",
  INTERACT: "e",
  INSPECT: "L",
  INVENTORY: "i",
  TARGET: "t",
  CONSUME: "c",
  DROP: "d",
  WIELD: "w",
  WEAR: "W",
  REMOVE: "r",

  STAIRS_DOWN: ">",
  STAIRS_UP: "<",
  SHOW_LOG: "H",

  CONFIRM: "Enter",
  CANCEL: "Escape", // sometimes used differently depending on state

  SAVE: "1",
  LOAD: "2",

  TOGGLE_MAKER_MODE: "M",
  TOGGLE_MAKER_MODE_PREFAB_SELECT: "e",

  // cheats
  TOGGLE_DEBUG: "F1",
  TOGGLE_SEE_ALL: "F2",
  TOGGLE_SEE_ODOR_MAP: "F3",
  TOGGLE_SEE_VISION_MAP: "F4",
  TOGGLE_SEE_SOUND_MAP: "F5",
} as const;

export const isMoveKey = (key: string): boolean =>
  (Keys.MOVE_LEFT as readonly string[]).includes(key) ||
  (Keys.MOVE_DOWN as readonly string[]).includes(key) ||
  (Keys.MOVE_UP as readonly string[]).includes(key) ||
  (Keys.MOVE_RIGHT as readonly string[]).includes(key);

export const getDirectionFromKey = (key: string) => {
  if ((Keys.MOVE_LEFT as readonly string[]).includes(key))
    return { dx: -1, dy: 0 };
  if ((Keys.MOVE_DOWN as readonly string[]).includes(key))
    return { dx: 0, dy: 1 };
  if ((Keys.MOVE_UP as readonly string[]).includes(key))
    return { dx: 0, dy: -1 };
  if ((Keys.MOVE_RIGHT as readonly string[]).includes(key))
    return { dx: 1, dy: 0 };
  return null;
};

export const handleUserInput = (input: KeyboardEvent | string) => {
  const key = input instanceof KeyboardEvent ? input.key : input;

  if (IGNORED_KEYS.includes(key)) return;

  setState((state: State) => {
    state.userInput = input instanceof KeyboardEvent ? input : new KeyboardEvent('keydown', { key });
  });
};
