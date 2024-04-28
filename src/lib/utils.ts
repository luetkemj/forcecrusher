import { Entity } from "../ecs/engine";
import { setState, State } from "../main";

export const logFrozenEntity = (entity: Entity) => {
  console.log(JSON.parse(JSON.stringify(entity)));
};

export const addLog = (message: string) => {
  setState((state: State) => state.log.push(message));
};
