import { InputContext } from "../systems/userInput.system";
import { GameState, State, Turn } from "../gameState";

export const handleInteractActionModeInput = ({
  key,
  world,
  state,
  player,
  setState,
}: InputContext) => {
  if (key === "e" || key === "Escape") {
    setState((state: State) => {
      state.gameState = GameState.GAME;
    });
  }

  const { interactActions, interactTargets } = state;
  const [target] = interactTargets;
  const actor = player;

  const afterInteractCleanUp = () => {
    setState((state: State) => {
      state.interactActions = "";
      state.interactTargets = [];
      state.gameState = GameState.GAME;
      state.turn = Turn.WORLD;
    });
  };

  // attack
  if (interactActions.includes("§a§")) {
    if (key === "a") {
      world.addComponent(actor, "tryAttack", { targetId: target.id });
      afterInteractCleanUp();
      return true;
    }
  }
  // close
  if (interactActions.includes("§c§")) {
    if (key === "c") {
      world.addComponent(actor, "tryClose", target);
      afterInteractCleanUp();
      return true;
    }
  }
  // get
  if (interactActions.includes("§g§")) {
    if (key === "g") {
      world.addComponent(target, "tryPickUp", {
        pickerId: actor.id,
      });
      afterInteractCleanUp();
      return true;
    }
  }
  // kick
  if (interactActions.includes("§k§")) {
    if (key === "k") {
      world.addComponent(actor, "tryKick", { targetId: target.id });
      afterInteractCleanUp();
      return true;
    }
  }
  // open
  if (interactActions.includes("§o§")) {
    if (key === "o") {
      world.addComponent(actor, "tryOpen", { id: target.id });
      afterInteractCleanUp();
      return true;
    }
  }
};
