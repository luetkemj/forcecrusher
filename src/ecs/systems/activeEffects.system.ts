import { IGameWorld } from "../engine";

export const createActiveEffectsSystem = (world: IGameWorld["world"]) => {
  const activeEffectsQuery = world.with("activeEffects");

  return function activeEffects() {
    for (const entity of activeEffectsQuery) {
      const { activeEffects } = entity;
      activeEffects.forEach((effect) => {
        const component = entity[effect.component];

        if (component) {
          component.current += effect.delta;
        }
      });

      activeEffects.splice(0, activeEffects.length);
    }
  };
};
