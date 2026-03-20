import { IGameWorld } from "../engine";

export const createResolveEffectsActiveTimedSystem = ({
  world,
}: IGameWorld) => {
  const effectActiveTimedQuery = world.with("effectsActiveTimed");

  return function resolveEffectsActiveTimedSystem() {
    // this should be scoped to current actor
    for (const entity of effectActiveTimedQuery) {
    }
  };
};
