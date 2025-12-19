import { filter } from "lodash";
import { Pos, isAtSamePosition } from "../../lib/grid";
import { addLog, em, mixHexWeighted } from "../../lib/utils";
import { IGameWorld, type Entity } from "../engine";
import { OpenState } from "../enums";
import { type State, getState, setState } from "../gameState";

export const createInteractSystem = ({ world, registry }: IGameWorld) => {
  const renderableQueries = [
    world.with("position", "appearance", "layer400").without("excludeFromSim"),
    world.with("position", "appearance", "layer350").without("excludeFromSim"),
    world.with("position", "appearance", "layer325").without("excludeFromSim"),
    world.with("position", "appearance", "layer300").without("excludeFromSim"),
    world.with("position", "appearance", "layer250").without("excludeFromSim"),
    world.with("position", "appearance", "layer225").without("excludeFromSim"),
    world.with("position", "appearance", "layer200").without("excludeFromSim"),
    world.with("position", "appearance", "layer150").without("excludeFromSim"),
    world.with("position", "appearance", "layer125").without("excludeFromSim"),
    world.with("position", "appearance", "layer100").without("excludeFromSim"),
  ];

  function findTopRenderableAtPosition(
    queries: Iterable<Entity>[],
    pos: Pos,
  ): Entity[] {
    for (const query of queries) {
      const matches: Entity[] = [];
      for (const entity of query) {
        if (entity.position) {
          if (isAtSamePosition(entity.position, pos)) {
            // TODO:
            // check if it's a liquid layer
            // if it is, check if there's any liquid
            // if there is... say what it is somehow.
            // if there isn't, continue to the next layer...
            // for now I'm just skipping that layer...
            matches.push(entity);
          }
        }
      }
      if (matches.length) return matches;
    }
    return [];
  }

  return function interactSystem() {
    const playerId = getState().playerId;
    const actor = registry.get(playerId);
    if (!actor) return;

    const { interactDirection } = actor;

    if (!interactDirection) return;

    // get entities at interactDirection;
    const interactTargets = findTopRenderableAtPosition(
      renderableQueries,
      interactDirection,
    );

    if (interactTargets.length) {
      const target = interactTargets[0];
      if (target.fluidContainer) {
        const fluids = filter(
          target.fluidContainer.fluids,
          (x) => x.volume > 0,
        );

        if (fluids.length) {
          let interactTarget = {
            ...target,
            name: "",
            appearance: { tint: 0x000000, char: "", tileSet: "" },
          };

          if (fluids.length === 1) {
            interactTarget.name = `some ${fluids[0].type}`;
            interactTarget.appearance.tint = fluids[0].tint;
          } else if (fluids.length === 2) {
            interactTarget.name = `mixture of ${fluids[0].type} and ${fluids[1].type}`;
            interactTarget.appearance.tint = mixHexWeighted(
              fluids.map((x) => x.tint),
              fluids.map((x) => x.volume),
            );
          } else {
            const lastIndex = fluids.length - 1;
            const last = fluids[lastIndex];
            const most = fluids.slice(0, lastIndex);
            interactTarget.name = `mixture of ${most.map((x) => x.type).join(", ")} and ${last.type}`;
            interactTarget.appearance.tint = mixHexWeighted(
              fluids.map((x) => x.tint),
              fluids.map((x) => x.volume),
            );
          }

          setState((state: State) => {
            // Get any fluid containers from player inventory
            const fluidContainersInInventory = [];
            if (actor.container) {
              for (const eId of actor.container.contents) {
                const item = registry.get(eId);
                if (item && item.fluidContainer) {
                  fluidContainersInInventory.push(item);
                }
              }
            }

            // Get first found fluidContainerInInvetory
            // TODO: find first with room or allow player to select
            const applicator = fluidContainersInInventory[0];
            if (applicator) {
              state.interaction = {
                interactor: actor.id,
                target: interactTarget.id,
                applicator: applicator.id,
              };
            } else {
              state.interaction = {
                interactor: actor.id,
                target: interactTarget.id,
              };
            }
            state.interactTargets = [interactTarget];
            state.interactActions = getInteractActions(target, applicator);
          });
        }
      } else {
        setState((state: State) => {
          state.interaction = {
            interactor: actor.id,
            target: interactTargets[0].id,
          };
          state.interactTargets = interactTargets;
          state.interactActions = getInteractActions(target, null);
        });
      }
    } else {
      addLog("There is nothing there.");
    }

    world.removeComponent(actor, "interactDirection");
  };

  function getInteractActions(
    target: Entity | null,
    applicator: Entity | null,
  ) {
    console.log({ target, applicator });

    let actions = ``;
    if (
      target &&
      target.fluidContainer &&
      applicator &&
      applicator.fluidContainer
    ) {
      actions += `(${em("f")})fill `;
    }
    if (target && target.pickUp) {
      actions += `(${em("g")})get `;
    }
    if (target && target.health && target.health.current > 0) {
      actions += `(${em("a")})attack `;
    }
    if (target && target.kickable) {
      actions += `(${em("k")})kick `;
    }
    if (target && target.openable) {
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
