import { InputContext } from "../systems/userInput.system";
import { GameState, State, Turn } from "../gameState";
import { Keys } from "./KeyMap";

export const handleInteractActionModeInput = ({
  key,
  world,
  registry,
  state,
  player,
  setState,
}: InputContext) => {
  if (key === Keys.INTERACT || key === Keys.CANCEL) {
    setState((state: State) => {
      state.gameState = GameState.GAME;
    });
  }

  const { interactActions, interactTargets } = state;
  // targets can be an entity or a pseudo entity (like with fluids)
  // a pseudo entity has the id of the actual entity, so we need to get that
  const [maybeTarget] = interactTargets;
  const target = registry.get(maybeTarget.id);
  const actor = player;

  if (!target) return;

  const afterInteractCleanUp = () => {
    setState((state: State) => {
      state.interactActions = "";
      state.interactTargets = [];
      state.gameState = GameState.GAME;
      state.turn = Turn.WORLD;
    });
  };

  // attack
  if (interactActions.includes(`§${Keys.ATTACK}§`)) {
    if (key === Keys.ATTACK) {
      world.addComponent(actor, "tryAttack", { targetId: target.id });
      afterInteractCleanUp();
      return true;
    }
  }
  // close
  if (interactActions.includes(`§${Keys.CONSUME}§`)) {
    if (key === Keys.CONSUME) {
      world.addComponent(actor, "tryClose", target);
      afterInteractCleanUp();
      return true;
    }
  }
  // get
  if (interactActions.includes(`§${Keys.PICK_UP}§`)) {
    if (key === Keys.PICK_UP) {
      world.addComponent(target, "tryPickUp", {
        pickerId: actor.id,
      });
      afterInteractCleanUp();
      return true;
    }
  }
  // kick
  if (interactActions.includes(`§${Keys.KICK}§`)) {
    if (key === Keys.KICK) {
      world.addComponent(actor, "tryKick", { targetId: target.id });
      afterInteractCleanUp();
      return true;
    }
  }
  // open
  if (interactActions.includes(`§${Keys.OPEN}§`)) {
    if (key === Keys.OPEN) {
      world.addComponent(actor, "tryOpen", { id: target.id });
      afterInteractCleanUp();
      return true;
    }
  }
};
