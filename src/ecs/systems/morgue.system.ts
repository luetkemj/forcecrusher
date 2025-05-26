import { gameWorld } from "../engine";
import { setState, State, GameState } from "../../main";
import { addLog } from "../../lib/utils";

const world = gameWorld.world;

const livingEntities = world.with("health").without("dead");

export const morgueSystem = () => {
  for (const entity of livingEntities) {
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

      addLog(`${entity.name} has died!`);

      if (entity.pc) {
        setState((state: State) => (state.gameState = GameState.GAME_OVER));
        console.log("Game Over!");
      }
    }
  }
};
