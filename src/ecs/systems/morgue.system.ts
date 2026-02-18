import { IGameWorld } from "../engine";
import { setState, State, GameState } from "../gameState";
import { addLog, unWield, unWear, colorTag } from "../../lib/utils";

export const createMorgueSystem = ({ world, registry }: IGameWorld) => {
  const livingQuery = world
    .with("health")
    .without("dead", "destroyed", "excludeFromSim");

  return function morgueSystem() {
    for (const entity of livingQuery) {
      if (entity.health.current <= 0) {
        if (entity.appearance) {
          if (entity.appearanceCorpse) {
            entity.appearance = { ...entity.appearanceCorpse };
          } else {
            entity.appearance.char = "corpse";
          }
        }

        unWield(entity);
        unWear(entity);

        // drop inventory
        if (entity.container?.contents) {
          for (const eId of entity.container.contents) {
            const item = registry.get(eId);
            if (item) {
              world.addComponent(item, "tryDrop", { dropperId: entity.id });
            }
          }
        }

        const entityTint = entity.appearance?.tint || 0x00ff00;

        if (entity.living) {
          world.removeComponent(entity, "living");
          world.addComponent(entity, "dead", true);
          addLog(`${colorTag(entityTint)}${entity.name}§purple§ has died!`);
        } else {
          world.addComponent(entity, "destroyed", true);
          addLog(
            `${colorTag(entityTint)}${entity.name}§purple§ has been destroyed!`,
          );
        }

        world.removeComponent(entity, "ai");
        world.removeComponent(entity, "blocking");
        world.removeComponent(entity, "opaque");
        world.removeComponent(entity, "layer300");
        world.removeComponent(entity, "openable");
        world.removeComponent(entity, "legendable");

        world.addComponent(entity, "pickUp", true);
        world.addComponent(entity, "layer200", true);

        if (entity.fluidContainer) {
          world.removeComponent(entity, "desiccate");
          entity.fluidContainer.corked = false;
        }

        if (entity.pc) {
          setState((state: State) => (state.gameState = GameState.GAME_OVER));
          console.log("Game Over!");
        }
      }
    }
  };
};
