import { IGameWorld } from "../engine";
import { getState, setState, State } from "../../main";
import { toPosId } from "../../lib/grid";

export const createCursorSystem = (world: IGameWorld["world"]) => {
  const inspectableQuery = world.with("revealed", "position");

  return function cursor() {
    const cursorPosId = toPosId(getState().cursor[1]);

    const layer100 = [];
    const layer200 = [];
    const layer300 = [];

    for (const entity of inspectableQuery) {
      if (cursorPosId === toPosId(entity.position)) {
        if (entity.layer100) layer100.push(entity);
        if (entity.layer200) layer200.push(entity);
        if (entity.layer300) layer300.push(entity);
      }
    }

    if (layer100.length) {
      let message = "";

      const baseNames: Array<string> = [];
      layer100.forEach((entity) => baseNames.push(entity.name));

      if (layer100[0].inFov) {
        message += "You see ";
      } else {
        message += "You recall seeing ";
      }

      if (layer300.length || layer200.length) {
        const names: Array<string> = [];
        layer300.forEach((entity) => names.push(entity.name));
        layer200.forEach((entity) => names.push(entity.name));

        if (names.length) {
          names.forEach((name, index) => {
            if (names.length > 1 && index === names.length - 1) {
              message += `and a ${name} `;
            } else {
              message += `a ${name} `;
            }
          });

          message += `on the ${baseNames[0]}`;
        }
      } else {
        message += `the ${baseNames[0]}`;
      }

      setState((state: State) => {
        state.senses.see = message;
      });
    } else {
      setState((state: State) => {
        state.senses.see = `You see nothing.`;
      });
    }
  };
};
