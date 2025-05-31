import { gameWorld } from "../engine";

const activeEffectEntities = gameWorld.world.with("activeEffects");

export const activeEffectsSystem = () => {
  for (const entity of activeEffectEntities) {
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
