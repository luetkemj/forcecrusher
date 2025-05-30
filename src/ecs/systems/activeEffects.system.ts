import { gameWorld } from "../engine";

export const activeEffectsSystem = () => {
  const activeEffectEntities = gameWorld.world.with("activeEffects");

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
