import { IGameWorld } from "../engine";

export const createAccumulateEnergySystem = ({ world }: IGameWorld) => {
  const actorsQuery = world.with("speed", "energy");

  return function accumulateEnergySystem() {
    for (const entity of actorsQuery) {
      entity.energy += entity.speed;
    }
  };
};
