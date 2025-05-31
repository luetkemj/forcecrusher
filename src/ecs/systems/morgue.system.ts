import { gameWorld } from "../engine";
import { setState, State, GameState } from "../../main";
import { addLog } from "../../lib/utils";

const livingEntities = gameWorld.world.with("health").without("dead");

export const morgueSystem = () => {
  for (const entity of livingEntities) {
    if (entity.health.current <= 0) {
      if (entity.appearance) {
        entity.appearance.char = "%";
      }

      gameWorld.world.removeComponent(entity, "ai");
      gameWorld.world.removeComponent(entity, "blocking");
      gameWorld.world.removeComponent(entity, "layer300");

      gameWorld.world.addComponent(entity, "dead", true);
      gameWorld.world.addComponent(entity, "pickUp", true);
      gameWorld.world.addComponent(entity, "layer200", true);

      addLog(`${entity.name} has died!`);

      if (entity.pc) {
        setState((state: State) => (state.gameState = GameState.GAME_OVER));
        console.log("Game Over!");
      }
    }
  }
};
