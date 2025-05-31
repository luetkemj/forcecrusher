import { random } from "lodash";
import { Entity } from "../ecs/engine";
import { getState, setState, State } from "../main";
import { Pos } from "./grid";

export const logFrozenEntity = (entity: Entity) => {
  console.log(JSON.parse(JSON.stringify(entity)));
};

export const addLog = (message: string) => {
  setState((state: State) => state.log.push(message));
};

export const outOfBounds = (pos: Pos) => {
  const { x, y } = pos;
  const { width, height } = getState().views.map!;
  return x < 0 || y < 0 || x >= width || y >= height;
};

export const isSamePosition = (blocker: Pos, blockee: Pos) => {
  if (
    blocker.x === blockee.x &&
    blocker.y === blockee.y &&
    blocker.z === blockee.z
  ) {
    return true;
  }
  return false;
};

export const d4 = random(1, 4);
export const d8 = random(1, 8);
export const d10 = random(1, 10);
export const d12 = random(1, 12);
export const d20 = random(1, 20);
export const d100 = random(1, 100);
