import { IGameWorld } from "../engine";
import { setState, State, GameState } from "../gameState";
import { addLog, unWield, unWear, colorTag } from "../../lib/utils";

export const createMorgueSystem = (
  world: IGameWorld["world"],
  registry: IGameWorld["registry"],
) => {
  const livingQuery = world.with("health").without("dead");

  return function system() {
    for (const entity of livingQuery) {
      if (entity.health.current <= 0) {
        if (entity.appearance) {
          entity.appearance.char = "%";
        }

        world.removeComponent(entity, "ai");
        world.removeComponent(entity, "blocking");
        world.removeComponent(entity, "layer300");

        world.addComponent(entity, "dead", true);
        world.addComponent(entity, "pickUp", true);
        world.addComponent(entity, "layer200", true);

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
        addLog(`${colorTag(entityTint)}${entity.name}§purple§ has died!`);

        if (entity.pc) {
          setState((state: State) => (state.gameState = GameState.GAME_OVER));
          console.log("Game Over!");
        }
      }
    }
  };
};
