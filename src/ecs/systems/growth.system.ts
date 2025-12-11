import { World } from "miniplex";
import { IGameWorld } from "../engine";
import type { Entity } from "../engine";
import { calculateFlammability } from "../../actors";

export const createGrowthSystem = ({ world }: IGameWorld) => {
  const growthQuery = world.with("growth");
  const evolveToQuery = world.with("evolveTo");

  return function growthSystem() {
    for (const entity of growthQuery) {
      if (entity.growth.currentStage < entity.growth.maxStage) {
        if (Math.random() < entity.growth.chanceToGrow) {
          const nextStage = entity.growth.currentStage + 1;
          evolveEntity(world, entity, nextStage);
          entity.growth.currentStage = nextStage;
        }
      }
    }

    for (const entity of evolveToQuery) {
      if (entity.growth) {
        evolveEntity(world, entity, entity.evolveTo.stage);
        entity.growth.currentStage = entity.evolveTo.stage;
      }
      world.removeComponent(entity, "evolveTo");
    }
  };
};

function evolveEntity(world: World<Entity>, entity: Entity, stage: number) {
  if (!entity.growth) return;

  const componentsToAdd = entity.growth.stages[stage]?.addComponents;
  if (componentsToAdd) {
    // add components from stage
    for (const [key, value] of Object.entries(componentsToAdd)) {
      world.removeComponent(entity, key as keyof Entity);
      world.addComponent(entity, key as keyof Entity, value);
    }
  }

  const componentsToRemove = entity.growth.stages[stage]?.removeComponents;
  if (componentsToRemove) {
    for (const key of componentsToRemove) {
      world.removeComponent(entity, key as keyof Entity);
    }
  }

  // calculate flamability
  // const { material, mass } = entity;
  // if (material && mass) {
  //   world.removeComponent(entity, "flammable");
  //   const flammability = calculateFlammability(material, mass);
  //   world.addComponent(entity, "flammable", flammability);
  // }
}
