import { World } from "miniplex";
import { IGameWorld } from "../engine";
import type { Entity, Mutation } from "../engine";
import { cloneDeep } from "lodash";

export const createMutableSystem = ({ world }: IGameWorld) => {
  const mutableQuery = world
    .with("mutable")
    .without("dead", "mutateTo", "excludeFromSim");
  const mutateToQuery = world
    .with("mutateTo", "mutable")
    .without("excludeFromSim");

  return function mutableSystem() {
    for (const entity of mutableQuery) {
      const currentMutation = getCurrentMutation(entity);

      if (currentMutation && currentMutation.next) {
        if (Math.random() < currentMutation.chanceToMutate) {
          const nextMutation = entity.mutable.mutations.find(
            (x) => x.name === currentMutation.next,
          );

          if (nextMutation) {
            // bail if next mutation is forbidden
            if (forbidNextMutation(currentMutation, nextMutation)) continue;

            evolveEntity(world, entity, nextMutation);
            entity.mutable.current = nextMutation.name;
          }
        }
      }
    }

    for (const entity of mutateToQuery) {
      const currentMutation = getCurrentMutation(entity);

      const nextMutation = entity.mutable.mutations.find(
        (x) => x.name === entity.mutateTo.name,
      );

      if (currentMutation && nextMutation) {
        if (forbidNextMutation(currentMutation, nextMutation)) continue;

        evolveEntity(world, entity, nextMutation);
        entity.mutable.current = nextMutation.name;
      }
      world.removeComponent(entity, "mutateTo");
    }
  };
};

function evolveEntity(
  world: World<Entity>,
  entity: Entity,
  mutation: Mutation,
) {
  if (!entity.mutable) return;

  const componentsToAdd = mutation.addComponents;
  if (componentsToAdd) {
    const nonObjectTypes = ["boolean", "number", "string"];

    for (const [key, value] of Object.entries(componentsToAdd)) {
      world.removeComponent(entity, key as keyof Entity);

      if (nonObjectTypes.includes(typeof value)) {
        world.addComponent(entity, key as keyof Entity, value);
      } else {
        const clone = cloneDeep(value);
        world.addComponent(entity, key as keyof Entity, clone);
      }
    }
  }

  const componentsToRemove = mutation.removeComponents;
  if (componentsToRemove) {
    for (const key of componentsToRemove) {
      world.removeComponent(entity, key as keyof Entity);
    }
  }
}

const getCurrentMutation = (entity: Entity): Mutation | undefined => {
  if (!entity.mutable) return;

  const currentMutation = entity.mutable.mutations.find((x) => {
    return x.name === entity.mutable?.current;
  });

  return currentMutation;
};

const forbidNextMutation = (current: Mutation, next: Mutation): boolean => {
  // bail if next mutation is forbidden
  if (current.forbid && next) {
    if (current.forbid.includes(next.name)) {
      return true;
    }
  }
  return false;
};
