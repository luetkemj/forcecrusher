import { IGameWorld } from "../engine";

export const createActiveEffectsSystem = ({ world }: IGameWorld) => {
  const activeEffectsQuery = world.with("activeEffects");

  return function activeEffectsSystem() {
    // this should be scoped to current actor
    for (const entity of activeEffectsQuery) {
      const { activeEffects } = entity;
      activeEffects.forEach((effect) => {
        const component = entity[effect.component];

        if (component) {
          const val = component.current + effect.delta;

          if (effect.delta > 0) {
            component.current =
              val > component.max && effect.ignoreMax ? val : component.max;
          }

          if (effect.delta < 0) {
            component.current =
              val < component.min && effect.ignoreMin ? val : component.min;
          }
        }
      });

      activeEffects.splice(0, activeEffects.length);
    }
  };
};
