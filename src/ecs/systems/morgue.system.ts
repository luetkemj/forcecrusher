import { world } from "../engine";
import { setState, State, GameState } from "../../main";

const livingEntities = world.with("health").without("dead");

export const morgueSystem = () => {
  for (const entity of livingEntities) {
    if (entity.health.current <= 0) {
      if (entity.appearance) {
        entity.appearance.char = "%";
      }

      world.removeComponent(entity, "ai");
      world.removeComponent(entity, "blocking");

      world.addComponent(entity, "dead", true);

      console.log(`${entity.name} has died!`);

      if (entity.pc) {
        setState((state: State) => (state.gameState = GameState.GAME_OVER));
        console.log("Game Over!");
      }
    }
  }
};
