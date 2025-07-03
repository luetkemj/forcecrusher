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
  TOGGLE_MAKER_MODE: "§",
  SHOW_LOG: "H",

  DEBUG_TOGGLE: "~",
  CONFIRM: "Enter",
  CANCEL: "Escape", // sometimes used differently depending on state

  SAVE: "1",
  LOAD: "2",

  MAKER_MODE_SELECT_PREFAB: "e",
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
