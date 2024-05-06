import { Entity } from "../ecs/engine";
import { getState, setState, State } from "../main";
import {Pos} from './grid';

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
