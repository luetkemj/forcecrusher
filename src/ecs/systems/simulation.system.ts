import { IGameWorld } from "../engine";
import { State, getState, setState } from "../gameState";

export const createSimulationSystem = (gameWorld: IGameWorld) => {
  const { world } = gameWorld;
  const playerQuery = world.with("pc");

  return function simulationSystem() {
    if (getState().simulationTurnsLeft > 0) {
      setState((state: State) => (state.simulationTurnsLeft -= 1));
    }

    for (const actor of playerQuery) {
      if (getState().simulationTurnsLeft <= 0) {
        world.removeComponent(actor, "excludeFromSim");
      } else {
        world.addComponent(actor, "excludeFromSim", true);
      }
    }
  };
};
