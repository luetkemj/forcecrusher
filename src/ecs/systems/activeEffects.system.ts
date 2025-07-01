import { IGameWorld } from "../engine";

export const createActiveEffectsSystem = ({ world }: IGameWorld) => {
  const activeEffectsQuery = world.with("activeEffects");

  return function system() {
    for (const entity of activeEffectsQuery) {
      const { activeEffects } = entity;
      activeEffects.forEach((effect) => {
        const component = entity[effect.component];

        if (component) {
          if (component.current + effect.delta > component.max) {
            component.current = component.max;
          } else {
            component.current += effect.delta;
          }
        }
      });

      activeEffects.splice(0, activeEffects.length);
    }
  };
};
