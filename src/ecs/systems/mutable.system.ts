import { World } from "miniplex";
import { IGameWorld } from "../engine";
import type { Entity, Mutation } from "../engine";

export const createMutableSystem = ({ world }: IGameWorld) => {
  const mutableQuery = world.with("mutable");
  // TODO: change neame to "mutateTo";
  const mutateToQuery = world.with("mutateTo");

  return function mutableSystem() {
    for (const entity of mutableQuery) {
      const currentMutation = entity.mutable.mutations.find(
        (x) => x.name === entity.mutable.current,
      );

      if (currentMutation && currentMutation.next) {
        if (Math.random() < currentMutation.chanceToMutate) {
          const nextMutation = entity.mutable.mutations.find(
            (x) => x.name === currentMutation.next,
          );

          if (nextMutation) {
            evolveEntity(world, entity, nextMutation);
            entity.mutable.current = nextMutation.name;
          }
        }
      }
    }

    for (const entity of mutateToQuery) {
      if (entity.mutable) {
        const mutation = entity.mutable.mutations.find(
          (x) => x.name === entity.mutateTo.name,
        );
        if (mutation) {
          evolveEntity(world, entity, mutation);
          entity.mutable.current = mutation.name;
        }
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
    // add components from mutation
    for (const [key, value] of Object.entries(componentsToAdd)) {
      // world.removeComponent(entity, key as keyof Entity);
      // world.addComponent(entity, key as keyof Entity, value);
      if (entity[key as keyof Entity]) {
        entity[key as keyof Entity] = {
          ...entity[key as keyof Entity],
          ...value,
        };
      }
    }
  }

  const componentsToRemove = mutation.removeComponents;
  if (componentsToRemove) {
    for (const key of componentsToRemove) {
      world.removeComponent(entity, key as keyof Entity);
    }
  }

  // call processes
  const processes = mutation.processes;
  if (processes) {
    for (const process of processes) {
      entity.postProcess.push(process);
    }
  }
}
