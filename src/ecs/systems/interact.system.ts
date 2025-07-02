import { isAtSamePosition } from "../../lib/grid";
import { addLog, em } from "../../lib/utils";
import { IGameWorld, type Entity } from "../engine";
import { OpenState } from "../enums";
import { type State, getState, setState } from "../gameState";

export const createInteractSystem = ({ world, registry }: IGameWorld) => {
  const renderable100Query = world.with("position", "appearance", "layer100");
  const renderable200Query = world.with("position", "appearance", "layer200");
  const renderable300Query = world.with("position", "appearance", "layer300");
  const renderable400Query = world.with("position", "appearance", "layer400");

  return function interactSystem() {
    const playerId = getState().playerId;
    const actor = registry.get(playerId);
    if (!actor) return;

    const { interactDirection } = actor;

    if (!interactDirection) return;

    // get entities at interactDirection;
    const interactTargets: Entity[] = [];

    for (const entity of renderable400Query) {
      if (isAtSamePosition(entity.position, interactDirection)) {
        interactTargets.push(entity);
      }
    }

    if (!interactTargets.length) {
      for (const entity of renderable300Query) {
        if (isAtSamePosition(entity.position, interactDirection)) {
          interactTargets.push(entity);
        }
      }
    }

    if (!interactTargets.length) {
      for (const entity of renderable200Query) {
        if (isAtSamePosition(entity.position, interactDirection)) {
          interactTargets.push(entity);
        }
      }
    }

    if (!interactTargets.length) {
      for (const entity of renderable100Query) {
        if (isAtSamePosition(entity.position, interactDirection)) {
          interactTargets.push(entity);
        }
      }
    }

    if (interactTargets.length) {
      const interactActions = getInteractActions(interactTargets[0]);
      setState((state: State) => {
        state.interactTargets = interactTargets;
        state.interactActions = interactActions;
      });
    } else {
      addLog("There is nothing there.");
    }

    world.removeComponent(actor, "interactDirection");
  };

  function getInteractActions(target: Entity) {
    let actions = ``;
    if (target.pickUp) {
      actions += `(${em("g")})get `;
    }
    if (target.health && target.health.current > 0) {
      actions += `(${em("a")})attack `;
    }
    if (target.kickable) {
      actions += `(${em("k")})kick `;
    }
    if (target.openable) {
      if (target.openable.state === OpenState.Open) {
        actions += `(${em("c")})close `;
      }
      if (target.openable.state === OpenState.Closed) {
        actions += `(${em("o")})open `;
      }
    }
    return actions;
  }
};
