import { IGameWorld } from "../engine";

export const accumulateEnergySystem = ({ world }: IGameWorld) => {
  const actorsQuery = world.with("speed", "energy");

  return function accumulateEnergySystem() {
    for (const entity of actorsQuery) {
      entity.energy += entity.speed;
    }
  };
};
